using System.ComponentModel.DataAnnotations;

namespace DuzeyYardimSistemi.Server.Models
{
    public class WorkingHourConfig
    {
        public int Id { get; set; }
        
        // e.g. "09:00"
        public TimeSpan StartTime { get; set; } = new TimeSpan(9, 0, 0);
        
        // e.g. "18:00"
        public TimeSpan EndTime { get; set; } = new TimeSpan(18, 0, 0);

        // Comma separated days: "Monday,Tuesday,Wednesday,Thursday,Friday"
        public string WorkDays { get; set; } = "Monday,Tuesday,Wednesday,Thursday,Friday";

        public bool IsHolidayProcessingEnabled { get; set; } = false;
    }
}
