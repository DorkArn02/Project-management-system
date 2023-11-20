
using AutoMapper;
using Szakdolgozat_backend.Dtos;
using Szakdolgozat_backend.Dtos.AssignedPersonDtos;
using Szakdolgozat_backend.Dtos.CommentDtos;
using Szakdolgozat_backend.Dtos.IssueDtos;
using Szakdolgozat_backend.Dtos.ProjectDtos;
using Szakdolgozat_backend.Dtos.ProjectListDtos;
using Szakdolgozat_backend.Dtos.UserDtos;
using Szakdolgozat_backend.Models;

namespace Szakdolgozat_backend.AutoMapperProfiles
{
    public class ProfileList : Profile
    {
        public ProfileList() 
        {
            CreateMap<Project, ProjectCreatedDTO>();
            CreateMap<Project, ProjectResponseDTO>();
            CreateMap<User, UserRegisterResponseDTO>();
            CreateMap<User, UserLoginResponseDTO>()
                .ForMember(dest => dest.AccessToken, opt => opt.Ignore());
            CreateMap<Comment, CommentResponseDTO>();
            CreateMap<Issue[], ChildrenIssueDTO[]>().ReverseMap();
            CreateMap<ProjectList, ProjectListResponseDTO>();
            CreateMap<Issue, IssueResponseDTO>()
           .ForMember(dest => dest.ReporterName, opt => opt.MapFrom(src => $"{src.User.LastName} {src.User.FirstName}"))
           .ForMember(dest => dest.Priority, opt => opt.MapFrom(src => src.Priority))
           .ForMember(dest => dest.AssignedPeople, opt => opt.MapFrom(src => src.AssignedPeople))
           .ForMember(dest => dest.Comments, opt => opt.MapFrom(src => src.Comments))
           .ForMember(dest => dest.IssueType, opt => opt.MapFrom(src => src.IssueType));


            CreateMap<Participant, ParticipantResponseDTO>()
                .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role.Name))
                .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.User.FirstName))
                .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.User.LastName));

            CreateMap<AssignedPerson, AssignedPersonDTO>()
              .ForMember(dest => dest.PersonName, opt => opt.MapFrom(src => $"{src.User.LastName} {src.User.FirstName}"));

            CreateMap<Comment, CommentResponseDTO>()
                .ForMember(dest => dest.AuthorName, opt => opt.MapFrom(src => $"{src.User.LastName} {src.User.FirstName}"));

        }
    }
}
