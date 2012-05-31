var DATE_DROPDOWNLIST_COUNT = 14;
var USER_LIST = [{ id: 1, name: "求黎建" }, { id: 2, name: "姚玉"}];
var PAYMENT_TYPE_LIST = [{ code: "CS", name: "现金" }, { code: "CC", name: "信用卡"}];
(function ($) {
    /*
    var userService = {
        select: function (onsuccess) {
            var src = this;
            $.ajax({
                url: '/services/user/select',
                type: 'get',
                success: function (data) { if (data.success) { src.list.userList = data.data; onsuccess(src, data.data); } }
            });
        }
    };
    var paymentTypeSerivce = {
        select: function (onsuccess) {
            var src = this;
            $.ajax({
                url: '/services/paymenttype/select',
                type: 'get',
                success: function (data) { if (data.success) { src.list.paymentTypeList = data.data; onsuccess(src, data.data); } }
            });
        }
    };
    */
    var accountService = {
        select: function (args, onsuccess) {
            var src = this;
            $.ajax({
                url: '/services/account/select',
                type: 'post',
                data: args.data,
                success: function (data) {
                    if (data.success) {
                        src.accountList = data.data;
                        onsuccess(src, data.data);
                    } 
                    else {
                        console.log({ input: args.data, output: data});
                    }
                }
            });
        },
        upsert: function (args, onsuccess) {
            var src = this;
            $.ajax({
                url: args.isInsert ? '/services/account/insert' : '/services/account/update',
                type: 'post',
                data: args.data,
                success: function (data) {
                    if (data.success) {
                        var account = data.data;
                        var accountList = src.accountList;
                        if (args.isInsert) {
                            accountList.push(account);
                        } else {
                            for (var i = 0; i < accountList.length; i++) {
                                var item = accountList[i];
                                if (item.id == account.id) {
                                    accountList[i] = account;
                                    break;
                                }
                            }
                        }
                        onsuccess(src, { args: args, data: account});
                    } 
                    else {
                        console.log({ input: args.data, output: data});
                    }
                }
            });
        },
        delete: function (args, onsuccess) {
            var src = this;
            $.ajax({
                url: '/services/account/delete',
                type: 'post',
                data: args.data,
                success: function (data) {
                    if (data.success) {
                        var account = data.data;
                        var accountList = src.accountList;
                        var tempIndex = -1;
                        for (var i = 0; i < accountList.length; i++) {
                            if (tempIndex >= 0) {
                                accountList[i-1] = accountList[i];
                            } else if (account.id == accountList[i].id) {
                                tempIndex = i;
                            }
                        }
                        accountList.pop();
                        onsuccess(src, { args: args, data: data.data });
                    } 
                    else {
                        console.log({ input: args.data, output: data});
                    }
                }
            });
        }
    };

    var Page = function () {
        this.list = {
            $html: $('ul.list'),
            searchBar: {
                $html: $('.searchbar'),
                val: function (name, value) {
                    var src = this.$html.find('input[name="' + name + '"]');
                    if (value == undefined) {
                        return src.val();
                    }
                    else {
                        return src.val(value);
                    }
                },
                getFilter: function () {
                    return { startDate: this.val('startDate'), endDate: this.val('endDate') };
                }
            },
            accountList: [],
            total: { total: 0 },
            refresh: function (args) {
                if (this.isRefreshing) {
                    return;
                }
                this.isRefreshing = true;
                setTimeout(function(){ this.isRefreshing = false; }, 2000);
                args = args ? args : {};
                this.$html.find('li.footer').hide('slow');
                this.$html.find('li.body').hide('slow').remove();
                accountService.select.call(this, { data: { startDate: args.startDate, endDate: args.endDate} },
                    function (src, data) {
                        var accountList = src.accountList;
                        src.$html.find('li.body').remove();
                        for (var i = 0; accountList && i < accountList.length; i++) {
                            var $view = createViewItem(accountList[i]);
                            src.$html.find('li.footer').before($view);
                            $view.show('slow');
                        }
                        src.refreshTotal();
                        src.$html.find('li.footer').show('slow');
                        src.isRefreshing = false;
                    });
            },
            refreshTotal: function () {
                var total = { total: 0 }, accountList = this.accountList;
                for (var i = 0; accountList && i < accountList.length; i++) {
                    var item = accountList[i];
                    var amount = item.amount * 100;
                    total.total += amount;
                    if (!total['total_' + item.paymentTypeCode]) {
                        total['total_' + item.paymentTypeCode] = 0;
                    }
                    if (!total['total_' + item.userId]) {
                        total['total_' + item.userId] = 0;
                    }
                    total['total_' + item.paymentTypeCode] += amount;
                    total['total_' + item.userId] += amount;
                }
                var $total = this.$html.find('.footer .cell_total');
                $total.empty();
                $total.append('总计金额:<span>' + total.total / 100 + '</span>');
                if (total.total > 0) {
                    for (var i = 0; i < PAYMENT_TYPE_LIST.length; i++) {
                        var item = PAYMENT_TYPE_LIST[i];
                        var value = total['total_' + item.code];
                        value = value ? value / 100 : 0;
                        $total.append(item.name + ':<span>' + value + '</span>');
                    }
                    for (var i = 0; i < USER_LIST.length; i++) {
                        var item = USER_LIST[i];
                        var value = total['total_' + item.id];
                        value = value ? value / 100 : 0;
                        $total.append(item.name + ':<span>' + value + '</span>');
                    }
                }
            }
        };
        this.init = function () {
            var searchBar = this.list.searchBar;
            var today = new Date();
            searchBar.val('startDate', getDateString(getOffsetDate(today, -1)));
            searchBar.val('endDate', getDateString(today));

            this.list.refresh(searchBar.getFilter());

            searchBar.$html.find('#searchBtn').on('click', { list: this.list }, function (evt) {
                var list = evt.data.list;
                list.refresh(list.searchBar.getFilter());
            });

            searchBar.$html.find('.date').on('mousewheel', function(evt){
                var offset = evt.originalEvent.wheelDelta > 0 ? 1 : -1;
                var $src = $(evt.srcElement);
                var curDate = tryParseDate($src.val());
                if (curDate) {
                    var newDate = getOffsetDate(curDate, offset);
                    $src.val(getDateString(newDate));
                }
                evt.preventDefault();
            });

            this.list.$html.on('click', 'a.link_button', { list: this.list }, function (evt) {
                var $src = $(evt.srcElement);
                var $cur = $src.parents('li').eq(0);
                var a = $cur.find('a');
                a.prop({ disabled: true });
                setTimeout(3000, function() { a.prop({ disabled: false }); });
                var action = $src.attr('name');

                if (action == 'add') {
                    var $edit = createEditItem();
                    $cur.before($edit);
                    $edit.show('slow');
                    a.prop({ disabled: false });

                } else if (action == 'edit') {
                    var item = {
                        id: $cur.attr('data-id'),
                        date: $cur.find('.cell_date').attr('data-date'),
                        amount: $cur.find('.cell_amount').attr('data-amount'),
                        paymentTypeCode: $cur.find('.cell_paymenttype').attr('data-paymentTypeCode'),
                        userId: $cur.find('.cell_user').attr('data-userId'),
                        comments: $cur.find('.cell_comments').attr('data-comments')
                    };
                    var $edit = createEditItem(item);
                    $cur.after($edit);
                    $cur.hide('slow', function () {
                        $edit.show('slow');
                        a.prop({ disabled: false });
                    });                    

                } else if (action == 'cancel') {
                    var $view = $cur.prev();
                    $cur.hide('slow', function () { $cur.remove(); });
                    $view.show('slow');

                } else if (action == 'save') {
                    save(evt.data.list, $cur);

                } else if (action == 'delete') {
                    if (window.confirm('确定要删除吗？')) {
                        var item = {
                            id: $cur.attr('data-id')
                        };
                        // delete
                        accountService.delete.call(evt.data.list, { data: item }, function (src, data) {
                            $cur.hide('slow', function () { $cur.remove(); });
                            src.refreshTotal();
                        });
                    } else {
                        a.prop({ disabled: false });
                    }
                }
            });

            this.list.$html.on('keyup', 'li.edit', { list: this.list }, function (evt) {
                if (evt.which == 13) {
                    var $cur = $(this);
                    save(evt.data.list, $cur);
                }
            });

            return this;
        }; // init end

        // private functions
        function save(list, $cur)
        {
            var item = {
                id: $cur.attr('data-id'),
                date: $cur.find('[name="date"]').val(),
                amount: $cur.find('[name="amount"]').val(),
                paymentTypeCode: $cur.find('[name="paymentType"]').val(),
                userId: $cur.find('[name="user"]').val(),
                comments: $cur.find('[name="comments"]').val()
            };
            // save insert or update
            var isInsert = item.id ? false : true;
            accountService.upsert.call(list, { isInsert: isInsert, data: item }, function (src, data) {
                var account = data.data;
                if (!isInsert) {
                    $cur.prev().remove();
                }
                var $view = createViewItem(account);
                $cur.before($view);
                $cur.hide('slow', function () {
                    $cur.remove();
                    $view.show('slow');
                });
                src.refreshTotal();
            });
        }

        function createViewItem(item) {
            var $html = $(
            '<li class="body" style="display:none" data-id="' + item.id + '">'
                + '<div class="cell_controller">'
                    + '<a name="edit" class="link_button">编辑</a><a name="delete" class="link_button">删除</a></div>'
                + '<div class="cell_date" data-date="' + item.date + '">' + item.date + '</div>'
                + '<div class="cell_amount" data-amount="' + item.amount + '">' + item.amount + '</div>'
                + '<div class="cell_paymenttype" data-paymentTypeCode="' + item.paymentTypeCode + '">' + item.paymentType + '</div>'
                + '<div class="cell_user" data-userId="' + item.userId + '">' + item.user + '</div>'
                + '<div class="cell_comments" data-comments="' + item.comments + '">' + item.comments + '</div>'
            + '</li>');
            return $html;
        };

        function createEditItem(item) {
            var $html = $('<li class="body edit" style="display:none"></li>')
                .append($('<div class="cell_controller"><a name="save" class="link_button">保存</a><a name="cancel" class="link_button">取消</a></div>'))
                .append($('<div class="cell_date"></div>').append(createEditControl_Date()))
                .append($('<div class="cell_amount"><input name="amount" type="text" /></div>'))
                .append($('<div class="cell_paymenttype"></div>').append(createEditControl_PaymentType()))
                .append($('<div class="cell_user"></div>').append(createEditControl_User()))
                .append($('<div class="cell_comments"><input name="comments" type="text" /></div>'));
            if (item) {
                if (item.id) {
                    $html.attr('data-id', item.id);
                }
                if (item.date) {
                    $html.find('[name="date"]').val(item.date);
                }
                if (item.amount) {
                    $html.find('[name="amount"]').val(item.amount);
                }
                if (item.paymentTypeCode) {
                    $html.find('[name="paymentType"]').val(item.paymentTypeCode);
                }
                if (item.userId) {
                    $html.find('[name="user"]').val(item.userId);
                }
                if (item.comments) {
                    $html.find('[name="comments"]').val(item.comments);
                }
            }
            return $html;
        }

        function createEditControl_Date() {
            var $html = $(
            '<select name="date"></select>');
            var today = new Date();
            var count = DATE_DROPDOWNLIST_COUNT * -1;
            for (var i = 0; i > count; i--) {
                var dateString = getDateString(getOffsetDate(today, i));
                $html.append('<option value="' + dateString + '">' + dateString + '</option>');
            }
            return $html;
        }

        function createEditControl_PaymentType() {
            var $html = $('<select name="paymentType"></select>');
            for (var i = 0; i < PAYMENT_TYPE_LIST.length; i++) {
                $html.append($('<option value="' + PAYMENT_TYPE_LIST[i].code + '">' + PAYMENT_TYPE_LIST[i].name + '</option>'));
            }
            return $html;
        }

        function createEditControl_User() {
            var $html = $('<select name="user"></select>');
            for (var i = 0; i < USER_LIST.length; i++) {
                $html.append($('<option value="' + USER_LIST[i].id + '">' + USER_LIST[i].name + '</option>'));
            }
            return $html;
        }

        function getDateString(date) {
            date = date ? date : new Date();
            var yyyy = date.getFullYear().toString();
            var M = (date.getMonth() + 1).toString();
            var MM = M.length == 1 ? '0' + M : M;
            var d = date.getDate().toString();
            var dd = d.length == 1 ? '0' + d : d;
            return yyyy + '-' + MM + '-' + dd;
        }

        function getOffsetDate(date, offset) {
            date = date ? date : new Date();
            offset = offset ? offset : 0;
            var newDate = new Date();
            newDate.setTime(date.getTime() + 86400000 * offset);
            return newDate;
        }

        function tryParseDate(str) {
            var tick = Date.parse(str);
            if (tick) {
                return new Date(tick);
            }else {
                return undefined;
            }
        }
    }; // page end


    $(function () {
        window.page = new Page().init();
    });
})(window.jQuery); 
