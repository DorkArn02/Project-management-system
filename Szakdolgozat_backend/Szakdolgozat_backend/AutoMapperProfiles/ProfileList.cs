
using AutoMapper;
using Szakdolgozat_backend.Dtos;
using Szakdolgozat_backend.Dtos.AssignedPersonDtos;
using Szakdolgozat_backend.Dtos.AuditLogDtos;
using Szakdolgozat_backend.Dtos.CommentDtos;
using Szakdolgozat_backend.Dtos.IssueDtos;
using Szakdolgozat_backend.Dtos.NotificationDtos;
using Szakdolgozat_backend.Dtos.ProjectDtos;
using Szakdolgozat_backend.Dtos.ProjectListDtos;
using Szakdolgozat_backend.Dtos.UserDtos;
using Szakdolgozat_backend.Models;
using Szakdolgozat_backend.Services.AuditLogServiceFolder;

namespace Szakdolgozat_backend.AutoMapperProfiles
{
    public class ProfileList : Profile
    {
        public ProfileList() 
        {
            CreateMap<Notification, NotificationResponseDTO>()
                .ForMember(dest => dest.ProjectName, opt => opt.MapFrom(src => src.Project.Title))
                .ForMember(dest => dest.PersonName, opt => opt.MapFrom(src => $"{src.User.LastName} {src.User.FirstName}"));
            CreateMap<Project, ProjectCreatedDTO>();
            CreateMap<Project, ProjectResponseDTO>();
            CreateMap<User, UserInfoDTO>();
            CreateMap<User, UserRegisterResponseDTO>();
            CreateMap<User, UserLoginResponseDTO>()
                .ForMember(dest => dest.AccessToken, opt => opt.Ignore());
            CreateMap<Comment, CommentResponseDTO>();
            CreateMap<Issue[], ChildrenIssueDTO[]>().ReverseMap();
            CreateMap<ProjectList, ProjectListResponseDTO>()
                .ForMember(dest => dest.Issues, opt => opt.MapFrom(src => src.Issues.OrderBy(i=>i.Position).ToList()));
            CreateMap<Issue, IssueResponseDTO>()
           .ForMember(dest => dest.ReporterName, opt => opt.MapFrom(src => $"{src.User.LastName} {src.User.FirstName}"))
           .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => src.Priority))
           .ForMember(dest => dest.Comments, opt => opt.MapFrom(src => src.Comments))
           .ForMember(dest => dest.IssueType, opt => opt.MapFrom(src => src.IssueType))
           .ForMember(dest => dest.ReporterId, opt => opt.MapFrom(src => src.Id));


            CreateMap<Participant, ParticipantResponseDTO>()
                .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role.Name))
                .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.User.FirstName))
                .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.User.LastName));

            CreateMap<AssignedPerson, AssignedPersonDTO>()
              .ForMember(dest => dest.PersonName, opt => opt.MapFrom(src => $"{src.User.LastName} {src.User.FirstName}"));
                
            CreateMap<Comment, CommentResponseDTO>()
                .ForMember(dest => dest.AuthorName, opt => opt.MapFrom(src => $"{src.User.LastName} {src.User.FirstName}"));


            CreateMap<AuditLog, AuditLogResponseDTO>()
                .ForMember(dest => dest.ProjectName, opt => opt.MapFrom(src => src.Project.Title))
                .ForMember(dest => dest.PersonName, opt => opt.MapFrom(src => $"{src.User.LastName} {src.User.FirstName}"));
        }
    }
}
