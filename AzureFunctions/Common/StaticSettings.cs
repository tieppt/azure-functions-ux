using System;
using System.Configuration;
using System.Runtime.CompilerServices;

namespace AzureFunctions.Common
{
    public static class StaticSettings
    {
        private static string config(string @default = null, [CallerMemberName] string key = null)
        {
            var value = Environment.GetEnvironmentVariable(key) ?? ConfigurationManager.AppSettings[key];
            return string.IsNullOrEmpty(value)
                ? @default
                : value;
        }

        public static string UxStorage => config();
    }
}