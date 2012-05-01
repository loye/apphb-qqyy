using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Loye.QQYY.DAL;

namespace Loye.QQYY.Web.Handlers
{
    public class PaymentTypeService : ServiceBase
    {
        public override string ServiceName
        {
            get { return "PaymentType"; }
        }

        public override void Select(HttpContext context)
        {
            List<PaymentType> paymentTypeList;
            using (var model = new QQYYDataModel())
            {
                paymentTypeList = model.PaymentType.ToList();
            }
            context.Response.WriteJson(
                new
                {
                    success = true,
                    data = paymentTypeList.Select(p => new { code = p.Code, name = p.Name }),
                });
        }
    }
}