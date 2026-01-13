using DuzeyYardimSistemi.Server.Data;
using DuzeyYardimSistemi.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace DuzeyYardimSistemi.Server.Services
{
    public interface ISlaService
    {
        Task<DateTime?> CalculateDueDateAsync(TicketPriority priority, DateTime startDate);
    }

    public class SlaService : ISlaService
    {
        private readonly AppDbContext _context;

        public SlaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<DateTime?> CalculateDueDateAsync(TicketPriority priority, DateTime startDate)
        {
            // 1. Get Policy
            var policy = await _context.SlaPolicies.FirstOrDefaultAsync(p => p.Priority == priority);
            if (policy == null) return null; // No policy, no due date

            // 2. Get Working Hours
            var config = await _context.WorkingHourConfigs.FirstOrDefaultAsync();
            if (config == null) config = new WorkingHourConfig(); // Use defaults

            // Parse WorkDays
            var workDays = config.WorkDays.Split(',')
                .Select(d => Enum.Parse<DayOfWeek>(d.Trim(), true))
                .ToHashSet();

            // 3. Calculation Loop
            // We need to add 'policy.MaxResolutionTimeMinutes' working minutes to 'startDate'.
            
            var remainingMinutes = policy.MaxResolutionTimeMinutes;
            var current = startDate;

            // Safety: limit loops to prevent infinite if config is bad (e.g. no work days)
            int safetyCounter = 0;
            const int MAX_SAFETY = 100000; 

            // Simple minute-by-minute simulation or chunking.
            // For efficiency, we can jump to next start time if outside working hours.
            
            while (remainingMinutes > 0 && safetyCounter++ < MAX_SAFETY)
            {
                // Is current time within working hours?
                bool isWorkDay = workDays.Contains(current.DayOfWeek);
                // Check if current time is within [StartTime, EndTime)
                // We use TimeOfDay
                
                if (isWorkDay)
                {
                    var time = current.TimeOfDay;
                    
                    if (time >= config.StartTime && time < config.EndTime)
                    {
                        // We are in working hours.
                        // How much can we consume today?
                        var timeToClose = config.EndTime - time;
                        var minutesToClose = (int)timeToClose.TotalMinutes;

                        if (minutesToClose > remainingMinutes)
                        {
                            // We can finish today
                            current = current.AddMinutes(remainingMinutes);
                            remainingMinutes = 0;
                        }
                        else
                        {
                            // Consume rest of day
                            current = current.AddMinutes(minutesToClose);
                            remainingMinutes -= minutesToClose;
                            // Move to exact end time (which is effectively start of "after hours")
                        }
                    }
                    else if (time < config.StartTime)
                    {
                        // Before shift, jump to start
                        current = current.Date + config.StartTime;
                    }
                    else // time >= EndTime
                    {
                        // After shift, jump to next day start
                        current = current.Date.AddDays(1) + config.StartTime;
                    }
                }
                else
                {
                    // Not a work day, jump to next day start
                    current = current.Date.AddDays(1) + config.StartTime;
                }
            }

            return current;
        }
    }
}
