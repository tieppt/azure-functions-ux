using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace AzureFunctions.Models
{
    public class UxSettings
    {
        [JsonProperty("graphs")]
        public IEnumerable<Query> Graphs { get; set; } = Enumerable.Empty<Query>();
    }
}