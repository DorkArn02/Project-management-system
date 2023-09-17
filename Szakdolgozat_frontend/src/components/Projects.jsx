import React from 'react'
import { Heading, Flex, Skeleton, Spinner, Stack, Input, InputGroup, InputRightElement, Table, Avatar, Thead, Tr, Th, Td, useDisclosure, AvatarGroup, Tooltip, IconButton, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, Textarea, FormLabel, useToast, Text, FormErrorMessage } from "@chakra-ui/react"
import { FaArrowRight, FaPlus, FaSearch, FaTrash } from 'react-icons/fa'
import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { assignPeopleToProject, createUserProject, deleteProject, getUserProjects, updateProject } from '../api/project'
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

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [currentProject, setCurrentProject] = useState({})

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const toast = useToast()
    const navigate = useNavigate()

    const createProject = async () => {
        try {
            await createUserProject({ title, description }, user.accessToken)
            toast({
                title: 'Projekt létrehozva.',
                description: "",
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
            onClose()
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

    const handleDeleteProject = async (projectObject) => {
        try {
            await deleteProject(projectObject.id, user.accessToken)
            toast({
                title: 'Projekt törlése sikeres.',
                description: "",
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
            onCloseDelete()
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
            await assignPeopleToProject(currentProject.id, user.accessToken, data.email)
            toast({
                title: 'Siker.',
                description: "Személy hozzárendelés sikeres",
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
            onClosePeople()
            reset()
        } catch (e) {
            toast({
                title: 'Hiba.',
                description: `${e.response.data}`,
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
            reset()
        }
    }

    const handleDeletePeople = async (userId) => {

    }

    const handleModifyOpen = (projectObject) => {
        setCurrentProject(projectObject)
        setTitle(projectObject.title)
        setDescription(projectObject.description)
        onOpenModify()
    }

    const handleModifyProject = async (projectObject) => {
        try {
            await updateProject(projectObject.id, user.accessToken, { title, description })
            toast({
                title: 'Projekt adatainak módosítása sikeres.',
                description: "",
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
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
            setCurrentProject({})
        }
    }

    const IsUserProjectOwner = (participants) => {
        if (participants.filter(i => i.userId === user.id && i.roleName === "Owner").length !== 0) {
            return true
        }
        return false
    }

    useEffect(() => {
        const fetchProjects = async () => {
            const result = await getUserProjects(user.accessToken)
            setTimeout(() => {
                setProject(result.data)
            }, 500)
        }
        fetchProjects()
    }, [])

    if (project == null) {
        return <Flex h="100vh" w="full" align="center" justify="center">
            <Spinner size="xl" color="green.500" />
        </Flex>
    }
    else
        return (
            <>
                {/* Project létrehozás */}
                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Projekt létrehozása</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <form>
                                <Stack>
                                    <FormControl>
                                        <FormLabel>Projekt cím</FormLabel>
                                        <Input onChange={(e) => setTitle(e.target.value)} placeholder="Projekt cím" />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Projekt leírás</FormLabel>
                                        <Textarea onChange={(e) => setDescription(e.target.value)} placeholder="Projekt leírás" />
                                    </FormControl>
                                </Stack>
                            </form>
                        </ModalBody>

                        <ModalFooter>
                            <Button colorScheme='blue' mr={3} onClick={onClose}>
                                Visszavonás
                            </Button>
                            <Button onClick={() => createProject()} variant='ghost'>Létrehozás</Button>
                        </ModalFooter>
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
                            <Button colorScheme='blue' mr={3} onClick={() => handleDeleteProject(currentProject.id)} variant='solid'>Törlés</Button>
                            <Button onClick={onCloseDelete}>
                                Visszavonás
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
                {/* Project frissítése */}
                <Modal isOpen={isOpenModify} onClose={onCloseModify}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Projekt adatainak módosítása</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <ModalBody>
                                <form>
                                    <Stack>
                                        <FormControl>
                                            <FormLabel>Projekt cím</FormLabel>
                                            <Input defaultValue={currentProject.title} onChange={(e) => setTitle(e.target.value)} placeholder="Projekt cím" />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Projekt leírás</FormLabel>
                                            <Textarea defaultValue={currentProject.description} onChange={(e) => setDescription(e.target.value)} placeholder="Projekt leírás" />
                                        </FormControl>
                                    </Stack>
                                </form>
                            </ModalBody>
                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme='blue' mr={3} onClick={() => handleModifyProject(currentProject)} variant='solid'>Módosít</Button>
                            <Button onClick={onCloseModify}>
                                Visszavonás
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
                {/* Project személyek kezelése */}
                <Modal size={"3xl"} isOpen={isOpenPeople} onClose={onClosePeople}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Projekthez hozzárendelt személyek módosítása</ModalHeader>
                        <ModalCloseButton />
                        <form onSubmit={handleSubmit(handleAddPeople)}>
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
                                                        <IconButton isDisabled={i.userId === user.id} colorScheme='red' icon={<FaTrash />} />
                                                    </Td>
                                                </Tr>
                                            })}
                                        </Tbody>
                                    </Table>
                                    <FormControl isInvalid={errors.email}>
                                        <FormLabel>Személy meghívása a projektbe</FormLabel>
                                        <Input  {...register("email", { required: true })} type="email" placeholder="E-mail cím" />
                                        {errors.email ? <FormErrorMessage>Kérem adja meg a meghívandó személy e-mail címét</FormErrorMessage> : ""}
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
                <Flex gap={"20px"} flexDirection={"column"} mt={5}>
                    <Breadcrumb>
                        <BreadcrumbItem isCurrentPage>
                            <BreadcrumbLink href='/dashboard'>Összes projekt</BreadcrumbLink>
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
