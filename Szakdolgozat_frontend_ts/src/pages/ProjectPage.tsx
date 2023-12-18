import { Flex, Spinner, Stack, Input, InputGroup, InputRightElement, Table, Avatar, Thead, Tr, Th, Td, useDisclosure, AvatarGroup, Tooltip, IconButton, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, Textarea, FormLabel, useToast, Text } from "@chakra-ui/react"
import { FaArrowRight, FaPlus, FaSearch, FaTrash } from 'react-icons/fa'
import { assignPeopleToProject, createUserProject, deleteProject, getUserProjects, removePeopleFromProject, updateProject } from '../api/project'
import { useState } from 'react'
import moment from "moment"
import { FiSettings } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink, Tbody
} from '@chakra-ui/react'
import { BiUserPlus } from "react-icons/bi"
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { useMutation, useQuery } from "@tanstack/react-query"
import InputComponent from "../components/InputComponent"
import { isAxiosError } from "axios"
import { ParticipantRequest, ParticipantResponse, ProjectRequest, ProjectResponse } from "../interfaces/interfaces"
import { useTranslation } from "react-i18next"

export default function ProjectPage() {
    // AUTH
    const { user } = useAuth()

    // REACT-QUERY
    const { isLoading, data: project, error, refetch } = useQuery({
        queryKey: ['projects'],
        queryFn: () => getUserProjects().then(res => res.data),
        staleTime: 6000
    })

    const createProjectMutation = useMutation({
        mutationKey: ['createProject'],
        mutationFn: (projectRequest: ProjectRequest) => createUserProject(projectRequest)
    })

    const deleteProjectMutation = useMutation({
        mutationKey: ['deleteProject'],
        mutationFn: (projectId: string) => deleteProject(projectId)
    })

    const editProjectMutation = useMutation({
        mutationKey: ['editProject'],
        mutationFn: (param: ProjectRequest) => updateProject(currentProject.id!, param)
    })

    const addProjectToPersonMutation = useMutation({
        mutationKey: ['addPerson'],
        mutationFn: (param: string) => assignPeopleToProject(currentProject.id!, param)
    })

    const deletePersonFromProjectMutation = useMutation({
        mutationKey: ['deletePerson'],
        mutationFn: (param: string) => removePeopleFromProject(currentProject.id!, param)
    })

    // REACT ROUTER
    const navigate = useNavigate()

    // STATES
    const [search, setSearch] = useState<string>("")
    const [currentProject, setCurrentProject] = useState<Partial<ProjectResponse>>({})
    const [personId, setPersonId] = useState<string>()

    // MODAL
    const { isOpen: isOpenCreate, onOpen: onOpenCreate, onClose: onCloseCreate } = useDisclosure()
    const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure()
    const { isOpen: isOpenModify, onOpen: onOpenModify, onClose: onCloseModify } = useDisclosure()
    const { isOpen: isOpenPeople, onOpen: onOpenPeople, onClose: onClosePeople } = useDisclosure()
    const { isOpen: isOpenDeletePeople, onOpen: onOpenDeletePeople, onClose: onCloseDeletePeople } = useDisclosure()

    // REACT-HOOK-FORM
    const { register: registerAddPerson, handleSubmit: handleSubmitAddPerson, reset: resetAddPerson, formState: { errors: errorsAddPerson, isSubmitting: isSubmittingAddPerson } } = useForm<ParticipantRequest>();

    const { register: registerCreate, handleSubmit: handleSubmitCreate, reset: resetCreate, formState: { errors: errorsCreate, isSubmitting: isSubmittingCreate } } = useForm<ProjectRequest>();

    const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit } } = useForm<ProjectRequest>();

    const { handleSubmit: handleSubmitDelete, formState: { isSubmitting: isSubmittingDelete } } = useForm();

    // CHAKRA TOAST
    const toast = useToast()

    // METHODS
    const createProject = async (projectRequest: ProjectRequest) => {
        await createProjectMutation.mutateAsync(projectRequest, {
            onSuccess: () => {
                toast({
                    title: t('dashboard.popup_project_created'),
                    description: "",
                    status: 'success',
                    duration: 4000,
                    isClosable: true,
                })
                refreshProjectList()
                handleProjectCreateClose()
            },
            onError: () => {
                toast({
                    title: t('dashboard.error'),
                    description: t('dashboard.popup_project_created_error'),
                    status: 'error',
                    duration: 4000,
                    isClosable: true,
                })
            }
        })
    }

    const handleProjectCreateClose = () => {
        resetCreate()
        onCloseCreate()
    }

    const handleModifyClose = () => {
        resetEdit()
        onCloseModify()
    }

    const handleModifyOpen = (projectObject: ProjectResponse) => {
        setCurrentProject(projectObject)
        onOpenModify()
    }

    const handleModifyProject = async (object: ProjectRequest) => {
        await editProjectMutation.mutateAsync(object, {
            onSuccess: () => {
                toast({
                    title: t('dashboard.popup_project_modified'),
                    description: "",
                    status: 'success',
                    duration: 4000,
                    isClosable: true,
                })
                refreshProjectList()
                onCloseModify()
                setCurrentProject({})
            },
            onError: () => {
                toast({
                    title: t('dashboard.error'),
                    description: t('dashboard.popup_project_modified_error'),
                    status: 'error',
                    duration: 4000,
                    isClosable: true,
                })
                onCloseModify()
                setCurrentProject({})
            }
        })
    }

    const handleDeleteProject = async () => {
        await deleteProjectMutation.mutateAsync(currentProject.id!, {
            onSuccess: () => {
                toast({
                    title: t('dashboard.popup_project_deleted'),
                    description: "",
                    status: 'success',
                    duration: 4000,
                    isClosable: true,
                })
                onCloseDelete()
                refreshProjectList()
                setCurrentProject({})
            },
            onError: () => {
                toast({
                    title: t('dashboard.error'),
                    description: t('dashboard.popup_project_deleted_error'),
                    status: 'error',
                    duration: 4000,
                    isClosable: true,
                })
                setCurrentProject({})
            }
        })
    }

    const handleDeleteOpen = (projectObject: ProjectResponse) => {
        setCurrentProject(projectObject)
        onOpenDelete()
    }

    const handlePeopleOpen = (projectObject: ProjectResponse) => {
        setCurrentProject(projectObject)
        onOpenPeople()
    }

    const handleAddPeople = async (data: ParticipantRequest) => {
        await addProjectToPersonMutation.mutateAsync(data.email, {
            onSuccess: () => {
                toast({
                    title: t('dashboard.success'),
                    description: t('dashboard.popup_project_add_person'),
                    status: 'success',
                    duration: 4000,
                    isClosable: true,
                })
                refreshProjectList()
                onClosePeople()
                resetAddPerson()
            },
            onError(error) {
                if (isAxiosError(error)) {
                    if (error.response)
                        if (error.response.status === 404)
                            toast({
                                title: t('dashboard.error'),
                                description: t('dashboard.popup_project_add_person_error'),
                                status: 'error',
                                duration: 4000,
                                isClosable: true,
                            })
                        else if (error.response.status === 409)
                            toast({
                                title: t('dashboard.error'),
                                description: t('dashboard.popup_project_add_person_exist'),
                                status: 'error',
                                duration: 4000,
                                isClosable: true,
                            })
                    resetAddPerson()
                    onClosePeople()
                }
            }
        })
    }

    const handleCloseAddPerson = () => {
        resetAddPerson()
        onClosePeople()
    }

    const handleOpenDeletePeople = (id: string) => {
        setPersonId(id)
        onOpenDeletePeople()
    }

    const handleDeletePeople = async () => {
        await deletePersonFromProjectMutation.mutateAsync(personId!, {
            onSuccess: () => {
                toast({
                    title: t('dashboard.popup_project_delete_person'),
                    description: "",
                    status: 'success',
                    duration: 4000,
                    isClosable: true,
                })
                refreshProjectList()
                onCloseDeletePeople()
                handleCloseAddPerson()
            },
            onError: () => {
                onCloseDeletePeople()
                handleCloseAddPerson()
            }
        })
    }

    const refreshProjectList = () => {
        refetch()
    }

    const IsUserProjectOwner = (participants: Array<ParticipantResponse>) => {
        if (user)
            if (participants.filter(i => i.userId === user.id! && i.roleName === "Owner").length !== 0) {
                return true
            }
        return false
    }

    if (error) {
        return <Text>Hiba van!</Text>
    }

    const { i18n, t, ready } = useTranslation()


    if (isLoading && ready) {
        return <Flex h="100vh" w="full" align="center" justify="center">
            <Spinner size="xl" color="green.500" />
        </Flex>
    }
    else
        return (
            <>
                {/* Project létrehozás */}
                <Modal isOpen={isOpenCreate} onClose={handleProjectCreateClose}>
                    <ModalOverlay w={"full"} />
                    <ModalContent margin={"auto"}>
                        <ModalHeader>{t('dashboard.modal_project_create')}</ModalHeader>
                        <ModalCloseButton />
                        <form autoComplete='off' onSubmit={handleSubmitCreate(createProject)}>
                            <ModalBody>
                                <Stack>
                                    <InputComponent
                                        register={registerCreate}
                                        name="title"
                                        type="text"
                                        required={true}
                                        label={t('dashboard.label_project_title')}
                                        placeholder={t('dashboard.label_project_title')}
                                        errorMessage={t('dashboard.label_project_title_error')}
                                        error={Boolean(errorsCreate.title)}
                                    />
                                    <FormControl isInvalid={Boolean(errorsCreate.description)}>
                                        <FormLabel>{t('dashboard.label_project_description')}</FormLabel>
                                        <Textarea {...registerCreate("description", { required: false })} placeholder={t('dashboard.label_project_description')} />
                                    </FormControl>
                                </Stack>
                            </ModalBody>
                            <ModalFooter>
                                <Button mr={3} onClick={handleProjectCreateClose}>
                                    {t('dashboard.btn_cancel')}
                                </Button>
                                <Button isLoading={isSubmittingCreate} type="submit" colorScheme='blue'>{t('dashboard.btn_create')}</Button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </Modal>
                {/* Project törlése */}
                <Modal isOpen={isOpenDelete} onClose={onCloseDelete}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>{t('dashboard.modal_project_delete')}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Text>{t('dashboard.modal_project_delete_confirm')}</Text>
                        </ModalBody>
                        <ModalFooter>
                            <form onSubmit={handleSubmitDelete(handleDeleteProject)}>
                                <Button mr={3} onClick={onCloseDelete}>
                                    {t('dashboard.btn_cancel')}
                                </Button>
                                <Button isLoading={isSubmittingDelete} colorScheme='blue' type="submit" variant='solid'>{t('dashboard.btn_delete')}</Button>
                            </form>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
                {/* Project frissítése */}
                <Modal isOpen={isOpenModify} onClose={handleModifyClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>{t('dashboard.modal_project_settings')}</ModalHeader>
                        <ModalCloseButton />
                        <form onSubmit={handleSubmitEdit(handleModifyProject)}>
                            <ModalBody>
                                <ModalBody>
                                    <Stack>
                                        <InputComponent
                                            label={t('dashboard.label_project_title')}
                                            defaultValue={currentProject.title}
                                            register={registerEdit}
                                            placeholder={t('dashboard.label_project_title')}
                                            required={true}
                                            name="title"
                                            type="text"
                                            error={Boolean(errorsEdit.title)}
                                            errorMessage={t('dashboard.label_project_title_error')}
                                        />
                                        <FormControl>
                                            <FormLabel>{t('dashboard.label_project_description')}</FormLabel>
                                            <Textarea {...registerEdit("description")} defaultValue={currentProject.description} placeholder={t('dashboard.label_project_description')} />
                                        </FormControl>
                                    </Stack>
                                </ModalBody>
                            </ModalBody>
                            <ModalFooter>
                                <Button isLoading={isSubmittingEdit} colorScheme='blue' mr={3} type="submit" variant='solid'>{t('dashboard.btn_settings')}</Button>
                                <Button onClick={handleModifyClose}>
                                    {t('dashboard.btn_cancel')}
                                </Button>
                            </ModalFooter>
                        </form>

                    </ModalContent>
                </Modal>
                {/* Project személyek kezelése */}
                <Modal size={"3xl"} isOpen={isOpenPeople} onClose={handleCloseAddPerson}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>{t('dashboard.modal_project_members')}</ModalHeader>
                        <ModalCloseButton />
                        <form onSubmit={handleSubmitAddPerson(handleAddPeople)}>
                            <ModalBody>
                                <Stack>
                                    <Table>
                                        <Thead>
                                            <Tr>
                                                <Th>{t('dashboard.table_full_name')}</Th>
                                                <Th>{t('dashboard.table_role')}</Th>
                                                <Th>{t('dashboard.table_actions')}</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {currentProject.participants && currentProject.participants.map((i, k) => {
                                                return <Tr key={k}>
                                                    <Td>{`${i.lastName} ${i.firstName}`}</Td>
                                                    <Td>{i.roleName}</Td>
                                                    <Td>
                                                        <IconButton aria-label="delete person from project" isDisabled={i.userId === user!.id} colorScheme='red' onClick={() => handleOpenDeletePeople(i.userId)} icon={<FaTrash />} />
                                                    </Td>
                                                </Tr>
                                            })}
                                        </Tbody>
                                    </Table>
                                    <InputComponent
                                        name="email"
                                        register={registerAddPerson}
                                        error={Boolean(errorsAddPerson.email)}
                                        required={true}
                                        type="email"
                                        placeholder={t('dashboard.label_email')}
                                        errorMessage={t('dashboard.label_invite_people_error')}
                                        label={t('dashboard.label_invite_people')}
                                        autoComplete="new-password"
                                    />
                                </Stack>
                            </ModalBody>
                            <ModalFooter>
                                <Button isLoading={isSubmittingAddPerson} type="submit" colorScheme='blue' mr={3} variant='solid'>{t('dashboard.btn_invite')}</Button>
                                <Button onClick={onClosePeople}>
                                    {t('dashboard.btn_cancel')}
                                </Button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </Modal>
                {/* Projekt személy törlés megerősítés */}
                <Modal isOpen={isOpenDeletePeople} onClose={onCloseDeletePeople}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Személy törlése</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Text>Biztosan törölnéd ezt a személyt a projekről?</Text>
                        </ModalBody>
                        <ModalFooter>
                            <form onSubmit={handleSubmitDelete(handleDeletePeople)}>
                                <Button mr={3} onClick={onCloseDeletePeople}>
                                    Visszavonás
                                </Button>
                                <Button isLoading={isSubmittingDelete} colorScheme='blue' type="submit" variant='solid'>Törlés</Button>
                            </form>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
                <Flex gap={"20px"} flexDirection={"column"} mt={5}>
                    <Breadcrumb>
                        <BreadcrumbItem isCurrentPage>
                            <BreadcrumbLink href='/dashboard'>{t('dashboard.dashboard_title')}</BreadcrumbLink>
                        </BreadcrumbItem>
                    </Breadcrumb>
                    <Stack direction={"row"}>
                        <InputGroup>
                            <InputRightElement pointerEvents='none'>
                                <FaSearch />
                            </InputRightElement>
                            <Input variant={"filled"} onChange={(e) => setSearch(e.target.value)} type='text' placeholder={t('dashboard.label_search')} />
                        </InputGroup>
                        <Button onClick={onOpenCreate} colorScheme='green' leftIcon={<FaPlus />}> {t('dashboard.create_project_btn')}</Button>
                    </Stack>
                    <Table maxW={"250px"} variant={"striped"}>
                        <Thead>
                            <Tr>
                                <Th>{t('dashboard.table_name')}</Th>
                                <Th>{t('dashboard.table_description')}</Th>
                                <Th>{t('dashboard.table_created')}</Th>
                                <Th>{t('dashboard.table_members')}</Th>
                                <Th>{t('dashboard.table_actions')}</Th>
                            </Tr>
                        </Thead>
                        <Tbody >
                            {project && project.filter(p => p.title.includes(search)).map((i: ProjectResponse, k: number) => {
                                return <Tr key={k}>
                                    <Td>{i.title}</Td>
                                    <Td display={["none", "table-cell"]}>{i.description}</Td>
                                    <Td display={["none", "table-cell"]}>{moment.utc(i.created).format("yyyy/MM/DD")}</Td>
                                    <Td userSelect={'none'}>
                                        <AvatarGroup size="sm" max={2}>
                                            {i.participants &&
                                                i.participants.map((p, k) => {
                                                    return <Tooltip key={k} label={`${p.lastName} ${p.firstName}\n - ${p.roleName}`}><Avatar name={`${p.lastName} ${p.firstName}`} size="sm" key={k} /></Tooltip>
                                                })}
                                        </AvatarGroup>
                                    </Td>
                                    <Td>
                                        <Stack direction="row">
                                            <Tooltip label={t('dashboard.tooltip_open_project')}>
                                                <IconButton aria-label="open project" onClick={() => navigate(`/dashboard/${i.id}`)} icon={<FaArrowRight />} colorScheme='green' />
                                            </Tooltip>
                                            <Tooltip label={t('dashboard.tooltip_settings_project')}>
                                                <IconButton aria-label="project settings" isDisabled={IsUserProjectOwner(i.participants) ? false : true} onClick={() => handleModifyOpen(i)} icon={<FiSettings />} colorScheme='blue' />
                                            </Tooltip>
                                            <Tooltip label={t('dashboard.tooltip_members_project')}>
                                                <IconButton aria-label="manage project people" isDisabled={IsUserProjectOwner(i.participants) ? false : true} onClick={() => handlePeopleOpen(i)} colorScheme='facebook' icon={<BiUserPlus />} />
                                            </Tooltip>
                                            <Tooltip label={t('dashboard.tooltip_delete_project')}>
                                                <IconButton aria-label="delete project" isDisabled={IsUserProjectOwner(i.participants) ? false : true} onClick={() => handleDeleteOpen(i)} icon={<FaTrash />} colorScheme='red' />
                                            </Tooltip>
                                        </Stack>
                                    </Td>
                                </Tr>
                            })}
                        </Tbody>
                    </Table>
                </Flex >
            </>
        )
}
