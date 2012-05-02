using System;
using System.Collections.Generic;
using System.Data.Objects;
using System.Linq;
using System.Linq.Expressions;
using System.Web;
using Loye.QQYY.DAL;

namespace Loye.QQYY.Web.Handlers
{
    public class AccountService : ServiceBase
    {
        public override string ServiceName { get { return "Account"; } }

        public override void Select(HttpContext context)
        {
            var request = context.Request;
            var response = context.Response;
            DateTime startDate;
            DateTime endDate;
            if (!DateTime.TryParse(request["startDate"], out startDate))
            {
                startDate = DateTime.MinValue;
            }
            if (!DateTime.TryParse(request["endDate"], out endDate))
            {
                endDate = DateTime.MaxValue;
            }
            IEnumerable<object> accounts;
            using (var model = new QQYYDataModel())
            {
                accounts = SearchAccount(model.Account, item => item.Date >= startDate && item.Date <= endDate);
            }
            context.Response.WriteJson(new { success = true, data = accounts });
        }

        public override void Insert(HttpContext context)
        {
            var request = context.Request;
            var response = context.Response;

            string serialNumber = Guid.NewGuid().ToString("n");
            DateTime date = DateTime.Parse(request["date"]).Date;
            decimal amount = decimal.Parse(request["amount"]);
            string paymentTypeCode = request["paymentTypeCode"];
            int userId = int.Parse(request["userId"]);
            string comments = request["comments"];
            object inserted;
            using (var model = new QQYYDataModel())
            {
                Account newAccount = model.Account.CreateObject();
                newAccount.SerialNumber = serialNumber;
                newAccount.Date = date;
                newAccount.Amount = amount;
                newAccount.PaymentTypeCode = paymentTypeCode;
                newAccount.DraweeId = userId;
                newAccount.Comments = comments;
                newAccount.EnterDate = DateTime.Now;
                model.AddToAccount(newAccount);
                model.SaveChanges();

                inserted = SearchAccount(model.Account, item => item.SerialNumber == newAccount.SerialNumber).First();
            }
            response.WriteJson(new { success = true, data = inserted });
        }

        public override void Update(HttpContext context)
        {
            var request = context.Request;
            var response = context.Response;

            int id = int.Parse(request["id"]);
            DateTime date = DateTime.Parse(request["date"]).Date;
            decimal amount = decimal.Parse(request["amount"]);
            string paymentTypeCode = request["paymentTypeCode"];
            int userId = int.Parse(request["userId"]);
            string comments = request["comments"];
            object updated;
            using (var model = new QQYYDataModel())
            {
                var account = model.Account.First(item => item.Id == id);
                account.Date = date;
                account.Amount = amount;
                account.PaymentTypeCode = paymentTypeCode;
                account.DraweeId = userId;
                account.Comments = comments;
                account.EnterDate = DateTime.Now;
                model.SaveChanges();
                updated = SearchAccount(model.Account, item => item.Id == account.Id).First();
            }
            context.Response.WriteJson(new { success = true, data = new { id = 1, } });
        }

        public override void Delete(HttpContext context)
        {
            var request = context.Request;
            var response = context.Response;
            int id = int.Parse(request["id"]);

            using (var model = new QQYYDataModel())
            {
                var account = model.Account.First(item => item.Id == id);
                model.Account.DeleteObject(account);
            }
            context.Response.WriteJson(new { success = true, data = new { id = id, } });
        }

        private IEnumerable<object> SearchAccount(ObjectSet<Account> accounts, Expression<Func<Account, bool>> predicate)
        {
            return accounts
                .Where(predicate)
                .OrderBy(item => item.Date)
                .Select(item => new
                {
                    id = item.Id,
                    date = item.Date,
                    amount = item.Amount,
                    paymentTypeCode = item.PaymentTypeCode,
                    paymentType = item.PaymentType.Name,
                    userId = item.DraweeId,
                    user = item.User.Name,
                    comments = item.Comments,
                })
                .ToList()
                .Select(item => new
                {
                    id = item.id,
                    date = item.date.Date.ToString("yyyy-MM-dd"),
                    amount = item.amount,
                    paymentTypeCode = item.paymentTypeCode,
                    paymentType = item.paymentType,
                    userId = item.userId,
                    user = item.user,
                    comments = item.comments,
                });
        }
    }
}
