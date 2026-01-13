namespace DuzeyYardimSistemi.Server.Dtos
{
    public class TicketStatusDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Order { get; set; }
        public bool IsInitial { get; set; }
        public bool IsFinal { get; set; }
        public int ProjectId { get; set; }
    }

    public class TicketStatusCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public int Order { get; set; }
        public bool IsInitial { get; set; }
        public bool IsFinal { get; set; }
        public int ProjectId { get; set; }
    }
}
