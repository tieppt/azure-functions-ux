using System;
using Newtonsoft.Json;

namespace AzureFunctions.Models
{
    public class Query
    {
        [JsonProperty("id")]
        public Guid? Id { get; set; }

        [JsonProperty("value")]
        public string Value { get; set; }

        [JsonProperty("createdTime")]
        public DateTimeOffset? CreatedTime { get; set; }

        [JsonProperty("modifiedTime")]
        public DateTimeOffset? ModifiedTime { get; set; }

        public Query()
        {
            Id = null;
            Value = string.Empty;
            CreatedTime = null;
            ModifiedTime = null;
        }

        public Query(string value)
        {
            Id = Guid.NewGuid();
            Value = value;
            CreatedTime = DateTimeOffset.UtcNow;
            ModifiedTime = DateTimeOffset.UtcNow;
        }
    }
}