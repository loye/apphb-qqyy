using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Loye.QQYY.DAL;

namespace Loye.QQYY.Web.Handlers
{
    public class UserService : ServiceBase
    {
        public override string ServiceName
        {
            get { return "User"; }
        }

        public override void Select(HttpContext context)
        {
            List<User> userList;
            using (var model = new QQYYDataModel())
            {
                userList = model.User.ToList();
            }
            context.Response.WriteJson(
                new
                {
                    success = true,
                    data = userList.Select(u => new
                    {
                        id = u.Id,
                        name = u.Name,
                        pinyin = u.Pinyin,
                    }),
                });
        }
    }
}