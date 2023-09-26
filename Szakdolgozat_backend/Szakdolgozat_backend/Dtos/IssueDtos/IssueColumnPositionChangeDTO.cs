namespace Szakdolgozat_backend.Dtos.IssueDtos
{
    public class IssueColumnPositionChangeDTO
    {
       public Dictionary<Guid, int> sourcePositions { get; set; }
        public Dictionary<Guid, int> destPositions { get; set; }
    }
}
