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

export default function ProjectPage() {
    // AUTH
    const { user } = useAuth()

    // REACT-QUERY
    const { isLoading, data: project, error, refetch } = useQuery({
        queryKey: ['projects'],
        queryFn: () => getUserProjects().then(res => res.data),
        staleTime: 6000 // 1 min
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
                    title: 'Projekt létrehozva.',
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
                    title: 'Hiba.',
                    description: "Projekt létrehozása sikertelen",
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
                    title: 'Projekt adatainak módosítása sikeres.',
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
                    title: 'Hiba.',
                    description: "Projekt adatainak módosítása sikertelen",
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
                    title: 'Projekt törlése sikeres.',
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
                    title: 'Hiba.',
                    description: "Projekt törlése sikertelen",
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
                    title: 'Siker.',
                    description: "Személy hozzárendelés sikeres",
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
                                title: 'Hiba.',
                                description: `Felhasználó ilyen e-mail címmel nem létezik.`,
                                status: 'error',
                                duration: 4000,
                                isClosable: true,
                            })
                        else if (error.response.status === 409)
                            toast({
                                title: 'Hiba.',
                                description: `A felhasználó már tagja a projektnek.`,
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
                    title: 'Személy törölve..',
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

    if (isLoading) {
        return <Flex h="100vh" w="full" align="center" justify="center">
            <Spinner size="xl" color="green.500" />
        </Flex>
    }
    else
        return (
            <>
                {/* Project létrehozás */}
                <Modal isOpen={isOpenCreate} onClose={handleProjectCreateClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Projekt létrehozása</ModalHeader>
                        <ModalCloseButton />
                        <form autoComplete='off' onSubmit={handleSubmitCreate(createProject)}>
                            <ModalBody>
                                <Stack>
                                    <InputComponent
                                        register={registerCreate}
                                        name="title"
                                        type="text"
                                        required={true}
                                        label="Projekt cím"
                                        placeholder="Projekt cím"
                                        errorMessage="Kérem adja meg a projekt címét."
                                        error={Boolean(errorsCreate.title)}
                                    />
                                    <FormControl isInvalid={Boolean(errorsCreate.description)}>
                                        <FormLabel>Projekt leírás</FormLabel>
                                        <Textarea {...registerCreate("description", { required: false })} placeholder="Projekt leírás" />
                                    </FormControl>
                                </Stack>
                            </ModalBody>
                            <ModalFooter>
                                <Button mr={3} onClick={handleProjectCreateClose}>
                                    Visszavonás
                                </Button>
                                <Button isLoading={isSubmittingCreate} type="submit" colorScheme='blue'>Létrehozás</Button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </Modal>
                {/* Project törlése */}
                <Modal isOpen={isOpenDelete} onClose={onCloseDelete}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Projekt törlése</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Text>Biztosan szeretné törölni a projektet? A hozzá tartozó táblák és ticket-ek is törlésre kerülnek.</Text>
                        </ModalBody>
                        <ModalFooter>
                            <form onSubmit={handleSubmitDelete(handleDeleteProject)}>
                                <Button mr={3} onClick={onCloseDelete}>
                                    Visszavonás
                                </Button>
                                <Button isLoading={isSubmittingDelete} colorScheme='blue' type="submit" variant='solid'>Törlés</Button>
                            </form>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
                {/* Project frissítése */}
                <Modal isOpen={isOpenModify} onClose={handleModifyClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Projekt adatainak módosítása</ModalHeader>
                        <ModalCloseButton />
                        <form onSubmit={handleSubmitEdit(handleModifyProject)}>
                            <ModalBody>
                                <ModalBody>
                                    <Stack>
                                        <InputComponent
                                            label="Projekt cím"
                                            defaultValue={currentProject.title}
                                            register={registerEdit}
                                            placeholder="Projekt cím"
                                            required={true}
                                            name="title"
                                            type="text"
                                            error={Boolean(errorsEdit.title)}
                                            errorMessage=" Kérem adja meg a projekt címét."
                                        />
                                        <FormControl>
                                            <FormLabel>Projekt leírás</FormLabel>
                                            <Textarea {...registerEdit("description")} defaultValue={currentProject.description} placeholder="Projekt leírás" />
                                        </FormControl>
                                    </Stack>
                                </ModalBody>
                            </ModalBody>
                            <ModalFooter>
                                <Button isLoading={isSubmittingEdit} colorScheme='blue' mr={3} type="submit" variant='solid'>Módosít</Button>
                                <Button onClick={handleModifyClose}>
                                    Visszavonás
                                </Button>
                            </ModalFooter>
                        </form>

                    </ModalContent>
                </Modal>
                {/* Project személyek kezelése */}
                <Modal size={"3xl"} isOpen={isOpenPeople} onClose={handleCloseAddPerson}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Projekthez hozzárendelt személyek módosítása</ModalHeader>
                        <ModalCloseButton />
                        <form onSubmit={handleSubmitAddPerson(handleAddPeople)}>
                            <ModalBody>
                                <Stack>
                                    <Table>
                                        <Thead>
                                            <Tr>
                                                <Th>Teljes név</Th>
                                                <Th>Beosztás</Th>
                                                <Th>Műveletek</Th>
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
                                        placeholder="E-mail cím"
                                        errorMessage="Kérem adja meg a meghívandó személy e-mail címét."
                                        label="Személy meghívása a projektbe"
                                        autoComplete="new-password"
                                    />
                                </Stack>
                            </ModalBody>
                            <ModalFooter>
                                <Button isLoading={isSubmittingAddPerson} type="submit" colorScheme='blue' mr={3} variant='solid'>Hozzárendel</Button>
                                <Button onClick={onClosePeople}>
                                    Visszavonás
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
                            <BreadcrumbLink href='/dashboard'>Áttekintő</BreadcrumbLink>
                        </BreadcrumbItem>
                    </Breadcrumb>
                    <Stack direction={"row"}>
                        <InputGroup>
                            <InputRightElement pointerEvents='none'>
                                <FaSearch />
                            </InputRightElement>
                            <Input variant={"filled"} onChange={(e) => setSearch(e.target.value)} type='text' placeholder='Projekt keresése' />
                        </InputGroup>
                        <Button onClick={onOpenCreate} colorScheme='green' leftIcon={<FaPlus />}>Létrehozás</Button>
                    </Stack>
                    <Table maxW={"250px"} variant={"striped"}>
                        <Thead>
                            <Tr>
                                <Th>Név</Th>
                                <Th>Leírás</Th>
                                <Th>Létrehozva</Th>
                                <Th>Résztvevők</Th>
                                <Th>Műveletek</Th>
                            </Tr>
                        </Thead>
                        <Tbody >
                            {project && project.filter(p => p.title.includes(search)).map((i: ProjectResponse, k: number) => {
                                return <Tr key={k}>
                                    <Td>{i.title}</Td>
                                    <Td>{i.description}</Td>
                                    <Td>{moment.utc(i.created).format("yyyy/MM/DD")}</Td>
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
                                            <Tooltip label={"Megnyitás"}>
                                                <IconButton aria-label="open project" onClick={() => navigate(`/dashboard/${i.id}`)} icon={<FaArrowRight />} colorScheme='green' />
                                            </Tooltip>
                                            <Tooltip label="Projekt beállítások">
                                                <IconButton aria-label="project settings" isDisabled={IsUserProjectOwner(i.participants) ? false : true} onClick={() => handleModifyOpen(i)} icon={<FiSettings />} colorScheme='blue' />
                                            </Tooltip>
                                            <Tooltip label={"Hozzárendelt személyek kezelése"}>
                                                <IconButton aria-label="manage project people" isDisabled={IsUserProjectOwner(i.participants) ? false : true} onClick={() => handlePeopleOpen(i)} colorScheme='facebook' icon={<BiUserPlus />} />
                                            </Tooltip>
                                            <Tooltip label={"Projekt törlése"}>
                                                <IconButton aria-label="delete project" isDisabled={IsUserProjectOwner(i.participants) ? false : true} onClick={() => handleDeleteOpen(i)} icon={<FaTrash />} colorScheme='red' />
                                            </Tooltip>
                                        </Stack>
                                    </Td>
                                </Tr>
                            })}
                        </Tbody>
                    </Table>
                </Flex>
            </>
        )
}
