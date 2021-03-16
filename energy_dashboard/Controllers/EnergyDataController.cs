using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Net.Http;

namespace energy_dashboard.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class EnergyDataController : ControllerBase
    {

        private readonly ILogger<EnergyDataController> _logger;

        public EnergyDataController(ILogger<EnergyDataController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var uri = new Uri("http://192.168.2.35:8086/query?db=solardb");
            using var client = new HttpClient();
            var formContent = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("q", "select * from \"solar.consumption.current\", \"solar.production.current\" WHERE time > now() - 30m;"),
            });

            var response = await client.PostAsync(uri.ToString(), formContent);
            var data = await response.Content.ReadAsStringAsync();

            return Ok(data);
        }
    }
}
