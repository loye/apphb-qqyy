using System;
using System.Text.RegularExpressions;
using System.Web;

namespace Loye.QQYY.Web.Handlers
{
    public abstract class ServiceBase : IHttpHandler
    {
        static Regex methodTypeRegex =
            new Regex(@"/services/(?<servicename>\w+)/(?<methodtype>\w+)",
                RegexOptions.Compiled | RegexOptions.IgnoreCase);

        public abstract string ServiceName { get; }

        public virtual bool IsReusable { get { return true; } }

        public virtual void ProcessRequest(HttpContext context)
        {
            try
            {
                switch (GetMethodType(context))
                {
                    case MethodType.Select:
                        Select(context);
                        break;
                    case MethodType.Insert:
                        Insert(context);
                        break;
                    case MethodType.Update:
                        Update(context);
                        break;
                    case MethodType.Delete:
                        Delete(context);
                        break;
                    default:
                    case MethodType.None:
                        throw new HttpException(404, "Method type is not found. RawRrl:" + context.Request.RawUrl);
                }
            }
            catch (Exception ex)
            {
                context.Response.WriteJson(new { success = false, message = ex.Message });
            }
            finally
            {
                context.Response.End();
            }
        }

        public virtual void Select(HttpContext context){
            throw new HttpException(404, "Method type \"Select\" is not supported.");
        }

        public virtual void Insert(HttpContext context)
        {
            throw new HttpException(404, "Method type \"Insert\" is not supported.");
        }

        public virtual void Update(HttpContext context)
        {
            throw new HttpException(404, "Method type \"Update\" is not supported.");
        }

        public virtual void Delete(HttpContext context)
        {
            throw new HttpException(404, "Method type \"Delete\" is not supported.");
        }

        private MethodType GetMethodType(HttpContext context)
        {
            MethodType result = MethodType.None;
            Match match = methodTypeRegex.Match(context.Request.RawUrl);
            if (match.Success)
            {
                string methodType = match.Groups["methodtype"].Value;
                if (!Enum.TryParse<MethodType>(methodType, true, out result))
                {
                    result = MethodType.None;
                }
            }
            return result;
        }
    }
}