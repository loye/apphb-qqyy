using System.Web;
using System.Web.Script.Serialization;

namespace Loye.QQYY.Web
{
    public static class _Extentions
    {
        static JavaScriptSerializer serializer = new JavaScriptSerializer();

        public static void WriteJson<T>(this HttpResponse response, T obj)
        {
            response.Clear();
            response.ContentType = "text/json";
            response.Write(serializer.Serialize(obj));
        }
    }
}