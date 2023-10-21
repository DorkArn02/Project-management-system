
using AutoMapper;
using Szakdolgozat_backend.Dtos.ProjectDtos;
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
        }
    }
}
