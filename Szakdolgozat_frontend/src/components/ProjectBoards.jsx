import React from 'react'
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getProjectById } from '../api/project'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    HStack,
    Box,
    Avatar,
    Text, Tooltip, Button, Input, FormLabel, FormErrorMessage,
    Modal, ModalOverlay, Stack, ModalContent, Select, Textarea, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, useDisclosure, useToast, Spacer, IconButton,
    Flex, VStack, InputGroup, InputRightElement, AvatarGroup, Badge, Divider, Spinner, useColorMode
} from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { FaPlus, FaSearch, FaTrash } from 'react-icons/fa'
import { addProjectBoard, getProjectBoards } from '../api/projectBoard'
import { useForm } from 'react-hook-form'
import { BsThreeDots } from "react-icons/bs"

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { AiFillCheckSquare } from "react-icons/ai"
import { addIssueToBoard, deleteIssueFromBoard } from '../api/issue'
import { FcHighPriority, FcLowPriority, FcMediumPriority } from "react-icons/fc"
import moment from "moment"
import { MultiSelect } from "chakra-multiselect"

export default function ProjectBoards() {

    const { user } = useAuth()
    const { projectId } = useParams()
    const [project, setProject] = useState()
    const [boards, setBoards] = useState()

    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isOpenAddIssue, onOpen: onOpenAddIssue, onClose: onCloseAddIssue } = useDisclosure()
    const { isOpen: isOpenIssue, onOpen: onOpenIssue, onClose: onCloseIssue } = useDisclosure()
    const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure()

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const [currentIssue, setCurrentIssue] = useState()
    const [currentBoardId, setCurrentBoardId] = useState()
    const { colorMode } = useColorMode()

    const [assignedPeople, setAssignedPeople] = useState([])
    const [people, setPeople] = useState([])

    const toast = useToast()

    useEffect(() => {
        const fetchProject = async () => {
            const result = await getProjectById(user.accessToken, projectId)
            setTimeout(() => {
                setProject(result.data)

                const arr = []
                result.data.participants.forEach(item => {
                    arr.push({ label: `${item.lastName} ${item.firstName}`, value: `${item.id}` })
                })

                setPeople(arr)

            }, 500)
        }
        fetchProject()
        const fetchProjectBoards = async () => {
            const result = await getProjectBoards(projectId, user.accessToken)
            setBoards(result.data)
        }
        fetchProjectBoards()
    }, [])

    const handleOpenIssue = (issueObject, boardId) => {
        setCurrentIssue(issueObject)
        setCurrentBoardId(boardId)
        onOpenIssue()
    }

    const handleAddBoard = async (data) => {
        try {
            await addProjectBoard(project.id, user.accessToken, { title: data.title, position: boards.length + 1 })
            toast({
                title: 'Board sikeresen létrehozva a projekthez.',
                description: "",
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
            handleCloseAddBoard()
        } catch (e) {
            toast({
                title: 'Hiba történt a board hozzáadása közben...',
                description: "",
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
            handleCloseAddBoard()
        }
    }

    const handleCloseAddBoard = () => {
        reset()
        onClose()
    }

    const handleDeleteIssue = async () => {
        try {
            await deleteIssueFromBoard(projectId, currentBoardId, currentIssue.id)
            toast({
                title: 'Issue sikeresen törölve!.',
                description: "",
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
            await updateProjectBoards()
            onCloseDelete()
            onCloseIssue()
        } catch (e) {
            toast({
                title: 'Hiba történt az issue törlésekor!.',
                description: "",
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
        }
    }

    // react-beautiful-dnd handle logic
    const handleOnDragEnd = (result) => {
        if (!result.destination) {
            return;
        }
        if (result.source.droppableId !== result.destination.droppableId) {
            const sourceList = boards.filter(b => b.id === result.source.droppableId)[0]
            const destinationList = boards.filter(b => b.id === result.destination.droppableId)[0]
            const [removed] = sourceList.issues.splice(result.source.index, 1);
            destinationList.issues.splice(result.destination.index, 0, removed);

            const newBoards = boards.map(item => {
                if (item.id === result.source.droppableId) {
                    return sourceList
                }
                else if (item.id === result.destination.droppableId) {
                    return destinationList
                } else {
                    return item
                }
            })
            setBoards(newBoards)

        }
        else {
            const sourceList = boards.filter(b => b.id === result.source.droppableId)[0]
            const [removed] = sourceList.issues.splice(result.source.index, 1);
            sourceList.issues.splice(result.destination.index, 0, removed);

            const newBoards = boards.map(item => {
                if (item.id === result.source.droppableId) {
                    return sourceList
                } else {
                    return item
                }
            })

            setBoards(newBoards)

        }
    }

    const handleAddIsueOpen = (boardId) => {
        setCurrentBoardId(boardId)
        onOpenAddIssue()
    }

    const handleAddIssueForm = async (object) => {
        const result =
            await addIssueToBoard(projectId, currentBoardId,
                { ...object, position: boards.filter(i => i.id === currentBoardId)[0].issues.length + 1 }, assignedPeople)
        if (result) {
            toast({
                title: 'Issue sikeresen létrehozva!.',
                description: "",
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
            await updateProjectBoards()
            onCloseAddIssue()
        }
    }

    const handleAddIssueClose = () => {
        reset()
        setAssignedPeople([])
        onCloseAddIssue()
    }

    const updateProjectBoards = async () => {
        const result = await getProjectBoards(projectId, user.accessToken)
        setBoards(result.data)
    }

    const handlePriorityIcon = (priority) => {
        if (priority.name === "Low") {
            return <FcLowPriority color={priority.color} />
        }
        else if (priority.name === "Medium") {
            return <FcMediumPriority color={priority.color} />
        }
        else if (priority.name === "High") {
            return <FcHighPriority color={priority.color} />
        }
        else if (priority.name === "Lowest") {
            return <FcLowPriority color={priority.color} />
        }
        else if (priority.name === "Highest") {
            return <FcHighPriority color={priority.color} />
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
                <Modal isOpen={isOpen} onClose={handleCloseAddBoard}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Board hozzáadása a projekthez</ModalHeader>
                        <ModalCloseButton />
                        <form onSubmit={handleSubmit(handleAddBoard)}>
                            <ModalBody>
                                <FormControl isInvalid={errors.title}>
                                    <FormLabel>Tábla neve</FormLabel>
                                    <Input {...register("title", { required: true })} type="text" />
                                    {errors.title ? <FormErrorMessage>Kérem adja meg a tábla címét.</FormErrorMessage> : ""}
                                </FormControl>
                            </ModalBody>
                            <ModalFooter>
                                <Button type="submit" colorScheme='blue' mr={3} variant='solid'>Hozzárendel</Button>
                                <Button onClick={handleCloseAddBoard}>
                                    Visszavonás
                                </Button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </Modal>

                <Modal size="xl" isOpen={isOpenAddIssue} onClose={handleAddIssueClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Ügy létrehozása</ModalHeader>
                        <form onSubmit={handleSubmit(handleAddIssueForm)}>
                            <ModalBody>
                                <Stack spacing={5}>
                                    <FormControl isRequired>
                                        <FormLabel>Cím</FormLabel>
                                        <Input type="text" {...register("title", { required: true })} />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Leírás</FormLabel>
                                        <Textarea type="text" {...register("description", { required: false })} />
                                    </FormControl>
                                    <FormControl>
                                        {project &&
                                            <MultiSelect value={assignedPeople} onChange={setAssignedPeople} options={people} label='Személyek hozzárendelése' />
                                        }
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Prioritás</FormLabel>
                                        <Select {...register("priorityId", { required: false })}>
                                            <option value={null}>-</option>
                                            <option value='5'>Legmagasabb</option>
                                            <option value='4'>Magas</option>
                                            <option value='3'>Közepes</option>
                                            <option value='2'>Alacsony</option>
                                            <option value='1'>Legalacsonyabb</option>
                                        </Select>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Becsült idő (óra)</FormLabel>
                                        <Input  {...register("timeEstimate", { required: false })} type="number" />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Határidő</FormLabel>
                                        <Input {...register("dueDate", { required: false })} type="date" />
                                    </FormControl>
                                </Stack>
                            </ModalBody>
                            <ModalFooter>
                                <Button mr={3} type="submit" colorScheme='blue'>Létrehozás</Button>
                                <Button onClick={handleAddIssueClose}>Visszavonás</Button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </Modal>

                <Modal isOpen={isOpenDelete} onClose={onCloseDelete}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>
                            <Text>Megerősítés</Text>
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Text>Biztos kitörli?</Text>
                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={handleDeleteIssue} colorScheme='blue' mr={2}>Törlés</Button>
                            <Button onClick={onCloseDelete}>Visszavonás</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                <Modal size="3xl" isOpen={isOpenIssue} onClose={onCloseIssue}>
                    <ModalOverlay />
                    {currentIssue ?
                        <ModalContent>
                            <ModalHeader>
                                <HStack>
                                    <AiFillCheckSquare color='blue' />
                                    <Text>{project.title} - {currentIssue.title}</Text>
                                </HStack>
                            </ModalHeader>
                            <IconButton onClick={onOpenDelete} size="sm" right={14} top={2} position={"absolute"} variant="ghost" icon={<FaTrash />} />
                            <ModalCloseButton />
                            <ModalBody>
                                <HStack gap="30px" align={"flex-start"}>
                                    <Flex w="full" direction={"column"}>
                                        <Input mb={5} fontSize={"3xl"} variant={"unstyled"} defaultValue={currentIssue.title} />
                                        <FormLabel>Leírás</FormLabel>
                                        <Textarea defaultValue={currentIssue.description} mb={5} />
                                        <FormLabel>Hozzászólások</FormLabel>
                                        <HStack align="baseline">
                                            <Avatar size="sm" name={currentIssue.reporterName} />
                                            <Textarea placeholder='Hozzászólás írása...' />
                                        </HStack>
                                    </Flex>
                                    <Box w="full">
                                        <FormLabel>Státusz</FormLabel>
                                        <Select>
                                            {boards.map((j, k) => {
                                                return <option key={k} value={j.id}>{j.title}</option>
                                            })}
                                        </Select>
                                        <FormLabel>Hozzárendelt személyek</FormLabel>
                                        {currentIssue.assignedPeople.map((i, k) => {
                                            return <Avatar key={k} size="sm" name={`${i.personName}`} />

                                        })}
                                        <FormLabel>Bejelentő</FormLabel>
                                        <Badge borderRadius={"10px"} p={"5px"}>
                                            <HStack>
                                                <Avatar name={currentIssue.reporterName} size="sm" />
                                                <Text>{currentIssue.reporterName}</Text>
                                            </HStack>
                                        </Badge>
                                        <FormLabel>Prioritás</FormLabel>
                                        <HStack align="center">
                                            {handlePriorityIcon(currentIssue.priority)}
                                            <Text>{currentIssue.priority.name}</Text>
                                        </HStack>
                                        <FormLabel>Becsült idő (órában)</FormLabel>
                                        <Input type="number" defaultValue={currentIssue.timeEstimate} />
                                        <FormLabel>Időkövetés</FormLabel>
                                        <FormLabel>Határidő</FormLabel>
                                        <Text>{moment(currentIssue.dueDate).format("yyyy/MM/DD")}</Text>
                                        <Divider mt={3} mb={3} />
                                        <Text>Létrehozva: {moment(currentIssue.created).fromNow()}</Text>
                                        <Text>Frissítve: {moment(currentIssue.updated).fromNow()}</Text>
                                    </Box>
                                </HStack>
                            </ModalBody>
                        </ModalContent>
                        : ""}
                </Modal>

                <Flex justify={"stretch"} gap={"20px"} flexDirection={"column"} mt={5}>
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <BreadcrumbLink as={Link} to='/dashboard'>Áttekintő</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem isCurrentPage>
                            <BreadcrumbLink href='#'>{project.title}</BreadcrumbLink>
                        </BreadcrumbItem>
                    </Breadcrumb>
                    <HStack>
                        <InputGroup w="300px" >
                            <InputRightElement pointerEvents='none'>
                                <FaSearch />
                            </InputRightElement>
                            <Input onChange={(e) => setSearch(e.target.value)} type='text' placeholder='Feladat keresése...' />
                        </InputGroup>
                        <AvatarGroup size={"md"}>
                            {project.participants.map((i, k) => {
                                return <Avatar name={`${i.lastName} ${i.firstName}`} key={k} />
                            })}
                        </AvatarGroup>
                    </HStack>
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        <HStack userSelect={"none"} gap={5} >
                            {boards && boards.map((i, k) => {
                                return <Stack
                                    key={k}
                                    height="90vh"
                                    width="200px"
                                    bg={colorMode === 'light' ? "gray.200" : "#444"}
                                    p={2}
                                    boxShadow={"lg"}
                                    gap={5}
                                >
                                    <HStack>
                                        <Tooltip label={i.title}>
                                            <Text noOfLines={"1"} textTransform={"uppercase"}>{i.title} - {i.issues.length}</Text>
                                        </Tooltip>
                                        <Spacer />
                                        <IconButton variant={"ghost"} icon={<BsThreeDots size={25} />} />
                                    </HStack>
                                    <Flex as={Button} gap={2} onClick={() => handleAddIsueOpen(i.id)} _hover={{ cursor: "pointer", bg: "gray.100" }} bg={colorMode === 'light' ? "white" : '#333'} align="center" borderRadius={5} p={1} justify={"center"}>
                                        <FaPlus />
                                        <Text>Ügy hozzáadása</Text>
                                    </Flex>
                                    <Droppable droppableId={`${i.id}`} direction='vertical'>
                                        {(provided, snapshot) => (
                                            <Flex overflow={"scroll"} overflowX={"hidden"} h="100%" {...provided.droppableProps}
                                                ref={provided.innerRef} gap={5} direction={"column"} bg={colorMode === 'light' ? (snapshot.isDraggingOver ? "gray.100" : "gray.200") : (snapshot.isDraggingOver ? "#333" : "#444")}>
                                                {
                                                    i.issues.map((issue, key) => {
                                                        return <Draggable key={issue.id} index={key} draggableId={`${issue.id}`}>
                                                            {provided => (
                                                                <VStack _hover={{ bg: "gray.100", cursor: 'pointer' }} onClick={() => handleOpenIssue(issue, i.id)} ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps} key={key} bg={colorMode === 'light' ? "white" : '#333'} align="center" borderRadius={5} p={1} justify={"center"}>
                                                                    <Text>{issue.title}</Text>
                                                                    <HStack w={"full"}>
                                                                        <AiFillCheckSquare color='blue' />
                                                                        {handlePriorityIcon(issue.priority)}
                                                                        <Spacer />
                                                                        <AvatarGroup size="xs" max={2}>
                                                                            {issue.assignedPeople.map((j, k) => {
                                                                                return <Avatar key={k} name={j.personName} />
                                                                            })}
                                                                        </AvatarGroup>
                                                                    </HStack>
                                                                </VStack>
                                                            )
                                                            }
                                                        </Draggable>
                                                    })
                                                }
                                                {provided.placeholder}
                                            </Flex>

                                        )
                                        }
                                    </Droppable>
                                </Stack>

                            })}
                            <Tooltip label="Board hozzáadása">
                                <Flex
                                    height="90vh"
                                    width="200px"
                                    bg="green.200"
                                    p={2}
                                    align={"center"}
                                    justify={"center"}
                                    _hover={{ cursor: "pointer", bg: "green.300" }}
                                    onClick={() => onOpen()}
                                >
                                    <FaPlus size={40} />
                                </Flex>
                            </Tooltip>
                        </HStack>
                    </DragDropContext>

                </Flex >
            </>
        )
}
