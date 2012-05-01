using Loye.QQYY.DAL;
using System;
using System.Collections.Generic;
using System.Web;
using System.Linq;

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
                accounts = model.Account
                    .Where(item => item.Date >= startDate && item.Date <= endDate)
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
            context.Response.WriteJson(new { success = true, data = accounts });
        }

        public override void Insert(HttpContext context)
        {
            var request = context.Request;
            var response = context.Response;
            Account account = new Account()
            {
                SerialNumber = Guid.NewGuid().ToString("n"),
                Date = DateTime.Parse(request["date"]).Date,
                Amount = decimal.Parse(request["amount"]),
                PaymentTypeCode = request["paymentTypeCode"],
                DraweeId = int.Parse(request["userId"]),
                Comments = request["comments"],
            };
            object inserted;
            using (var model = new QQYYDataModel())
            {
                Account newAccount = model.Account.CreateObject();
                newAccount.SerialNumber = account.SerialNumber;
                newAccount.Date = account.Date;
                newAccount.Amount = account.Amount;
                newAccount.PaymentTypeCode = account.PaymentTypeCode;
                newAccount.DraweeId = account.DraweeId;
                newAccount.Comments = account.Comments;
                newAccount.EnterDate = DateTime.Now;
                model.AddToAccount(newAccount);
                model.SaveChanges();
                inserted = model.Account
                    .Where(item => item.SerialNumber == newAccount.SerialNumber)
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
                    })
                    .First();
            }
            response.WriteJson(new { success = true, data = inserted });
        }

        public override void Update(HttpContext context)
        {
            context.Response.WriteJson(new { success = true, data = new { id = 1, }, serialNumber = Guid.NewGuid().ToString("n") });
        }

        public override void Delete(HttpContext context)
        {
            context.Response.WriteJson(new { success = true, data = new { id = 1, }, serialNumber = Guid.NewGuid().ToString("n") });
        }
    }
}
