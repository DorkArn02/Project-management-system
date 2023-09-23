import React from 'react'
import { Flex, Spinner, Stack, Input, InputGroup, InputRightElement, Table, Avatar, Thead, Tr, Th, Td, useDisclosure, AvatarGroup, Tooltip, IconButton, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, Textarea, FormLabel, useToast, Text, FormErrorMessage } from "@chakra-ui/react"
import { FaArrowRight, FaPlus, FaSearch, FaTrash } from 'react-icons/fa'
import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
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

export default function Projects() {

    const { user } = useAuth()

    const [project, setProject] = useState()
    const [search, setSearch] = useState("")
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure()
    const { isOpen: isOpenModify, onOpen: onOpenModify, onClose: onCloseModify } = useDisclosure()
    const { isOpen: isOpenPeople, onOpen: onOpenPeople, onClose: onClosePeople } = useDisclosure()
    const { isOpen: isOpenDeletePeople, onOpen: onOpenDeletePeople, onClose: onCloseDeletePeople } = useDisclosure()

    const [currentProject, setCurrentProject] = useState({})
    const [personId, setPersonId] = useState()

    const { register: registerAddPerson, handleSubmit: handleSubmitAddPerson, reset: resetAddPerson, formState: { errors: errorsAddPerson } } = useForm();
    const { register: registerCreate, handleSubmit: handleSubmitCreate, reset: resetCreate, formState: { errors: errorsCreate } } = useForm();
    const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, formState: { errors: errorsEdit } } = useForm();

    const toast = useToast()
    const navigate = useNavigate()

    useEffect(() => {
        const fetchProjects = async () => {
            const result = await getUserProjects()
            setTimeout(() => {
                setProject(result.data)
            }, 500)
        }
        fetchProjects()
    }, [])

    const handleDeleteProject = async () => {
        try {
            await deleteProject(currentProject.id)
            toast({
                title: 'Projekt törlése sikeres.',
                description: "",
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
            onCloseDelete()
            await refreshProjectList()
            setCurrentProject({})
        } catch (error) {
            toast({
                title: 'Hiba.',
                description: "Projekt törlése sikertelen",
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
            setCurrentProject({})
        }
    }

    const handleDeleteOpen = (projectObject) => {
        setCurrentProject(projectObject)
        onOpenDelete()
    }

    const handlePeopleOpen = (projectObject) => {
        setCurrentProject(projectObject)
        onOpenPeople()
    }

    const handleAddPeople = async (data) => {
        try {
            await assignPeopleToProject(currentProject.id, data.email)
            toast({
                title: 'Siker.',
                description: "Személy hozzárendelés sikeres",
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
            await refreshProjectList()
            onClosePeople()
            resetAddPerson()
        } catch (e) {
            toast({
                title: 'Hiba.',
                description: `${e.response.data}`,
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
            resetAddPerson()
            onClosePeople()
        }
    }

    const handleModifyClose = () => {
        resetEdit()
        onCloseModify()
    }

    const handleModifyOpen = (projectObject) => {
        setCurrentProject(projectObject)
        onOpenModify()
    }

    const handleModifyProject = async (object) => {
        try {
            await updateProject(currentProject.id, { title: object.title, description: object.description })
            toast({
                title: 'Projekt adatainak módosítása sikeres.',
                description: "",
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
            await refreshProjectList()
            onCloseModify()
            setCurrentProject({})
        } catch (error) {
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
    }

    const handleCloseAddPerson = () => {
        resetAddPerson()
        onClosePeople()
    }

    const refreshProjectList = async () => {
        const result = await getUserProjects()
        setProject(result.data)
    }

    const IsUserProjectOwner = (participants) => {
        if (participants.filter(i => i.userId === user.id && i.roleName === "Owner").length !== 0) {
            return true
        }
        return false
    }

    const createProject = async (object) => {
        try {
            await createUserProject({ title: object.title, description: object.description })
            toast({
                title: 'Projekt létrehozva.',
                description: "",
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
            await refreshProjectList()
            handleProjectCreateClose()
        } catch (error) {
            toast({
                title: 'Hiba.',
                description: "Projekt létrehozása sikertelen",
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
        }
    }

    const handleProjectCreateClose = () => {
        resetCreate()
        onClose()
    }

    const handleOpenDeletePeople = (id) => {
        setPersonId(id)
        onOpenDeletePeople()
    }

    const handleDeletePeople = async () => {
        try {
            await removePeopleFromProject(currentProject.id, personId)
            toast({
                title: 'Személy törölve..',
                description: "",
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
            await refreshProjectList()
            onCloseDeletePeople()
        } catch (e) {
            console.log(e)
        }
    }

    if (project == null) {
        return <Flex h="100vh" w="full" align="center" justify="center">
            <Spinner size="xl" color="green.500" />
        </Flex>
    }
    else
        return (
            <>
                {/* Project létrehozás */}
                <Modal isOpen={isOpen} onClose={handleProjectCreateClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Projekt létrehozása</ModalHeader>
                        <ModalCloseButton />
                        <form autoComplete='off' onSubmit={handleSubmitCreate(createProject)}>
                            <ModalBody>
                                <Stack>
                                    <FormControl isRequired isInvalid={errorsCreate.title}>
                                        <FormLabel>Projekt cím</FormLabel>
                                        <Input {...registerCreate("title", { required: true })} placeholder="Projekt cím" />
                                        {errorsCreate.title ? <FormErrorMessage>
                                            Kérem adja meg a projekt címét.
                                        </FormErrorMessage> : ""}
                                    </FormControl>
                                    <FormControl isInvalid={errorsAddPerson.description}>
                                        <FormLabel>Projekt leírás</FormLabel>
                                        <Textarea {...registerCreate("description", { required: false })} placeholder="Projekt leírás" />
                                    </FormControl>
                                </Stack>
                            </ModalBody>
                            <ModalFooter>
                                <Button mr={3} onClick={onClose}>
                                    Visszavonás
                                </Button>
                                <Button type="submit" colorScheme='blue'>Létrehozás</Button>
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
                            <Button mr={3} onClick={onCloseDelete}>
                                Visszavonás
                            </Button>
                            <Button colorScheme='blue' onClick={() => handleDeleteProject()} variant='solid'>Törlés</Button>
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
                                        <FormControl isRequired isInvalid={errorsEdit.title}>
                                            <FormLabel>Projekt cím</FormLabel>
                                            <Input defaultValue={currentProject.title} {...registerEdit("title", { required: true, })} placeholder="Projekt cím" />
                                            {errorsEdit && errorsEdit.title ?
                                                <FormErrorMessage>
                                                    Kérem adja meg a projekt címét.
                                                </FormErrorMessage>
                                                : ""}
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Projekt leírás</FormLabel>
                                            <Textarea {...registerEdit("description")} defaultValue={currentProject.description} placeholder="Projekt leírás" />
                                        </FormControl>
                                    </Stack>
                                </ModalBody>
                            </ModalBody>
                            <ModalFooter>
                                <Button colorScheme='blue' mr={3} type="submit" variant='solid'>Módosít</Button>
                                <Button onClick={onCloseModify}>
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
                                                        <IconButton isDisabled={i.userId === user.id} colorScheme='red' onClick={() => handleOpenDeletePeople(i.userId)} icon={<FaTrash />} />
                                                    </Td>
                                                </Tr>
                                            })}
                                        </Tbody>
                                    </Table>
                                    <FormControl isRequired isInvalid={errorsAddPerson.email}>
                                        <FormLabel>Személy meghívása a projektbe</FormLabel>
                                        <Input  {...registerAddPerson("email", { required: true })} type="email" placeholder="E-mail cím" />
                                        {errorsAddPerson.email ? <FormErrorMessage>Kérem adja meg a meghívandó személy e-mail címét</FormErrorMessage> : ""}
                                    </FormControl>
                                </Stack>
                            </ModalBody>
                            <ModalFooter>
                                <Button type="submit" colorScheme='blue' mr={3} variant='solid'>Hozzárendel</Button>
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
                            <Button mr={3} onClick={onCloseDeletePeople}>
                                Visszavonás
                            </Button>
                            <Button colorScheme='blue' onClick={() => handleDeletePeople()} variant='solid'>Törlés</Button>
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
                            <Input onChange={(e) => setSearch(e.target.value)} type='text' placeholder='Projekt keresése' />
                        </InputGroup>
                        <Button onClick={onOpen} colorScheme='green' leftIcon={<FaPlus />}>Létrehozás</Button>
                    </Stack>
                    <Table variant={"striped"}>
                        <Thead>
                            <Tr>
                                <Th>Név</Th>
                                <Th>Leírás</Th>
                                <Th>Létrehozva</Th>
                                <Th>Résztvevők</Th>
                                <Th>Műveletek</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {project && project.filter(p => p.title.includes(search)).map((i, k) => {
                                return <Tr key={k}>
                                    <Td>{i.title}</Td>
                                    <Td>{i.description}</Td>
                                    <Td>{moment.utc(i.created).format("yyyy/MM/DD")}</Td>
                                    <Td>
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
                                                <IconButton onClick={() => navigate(`/dashboard/${i.id}`)} icon={<FaArrowRight />} colorScheme='green' />
                                            </Tooltip>
                                            <Tooltip label="Projekt beállítások">
                                                <IconButton isDisabled={IsUserProjectOwner(i.participants) ? false : true} onClick={() => handleModifyOpen(i)} icon={<FiSettings />} colorScheme='blue' />
                                            </Tooltip>
                                            <Tooltip label={"Hozzárendelt személyek kezelése"}>
                                                <IconButton isDisabled={IsUserProjectOwner(i.participants) ? false : true} onClick={() => handlePeopleOpen(i)} colorScheme='facebook' icon={<BiUserPlus />} />
                                            </Tooltip>
                                            <Tooltip label={"Projekt törlése"}>
                                                <IconButton isDisabled={IsUserProjectOwner(i.participants) ? false : true} onClick={() => handleDeleteOpen(i)} icon={<FaTrash />} colorScheme='red' />
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
