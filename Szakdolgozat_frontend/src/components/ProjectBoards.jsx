import React from 'react'
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getProjectById } from '../api/project'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    HStack, Avatar,
    Text, Tooltip, Button, Input, FormLabel, FormErrorMessage,
    Modal, ModalOverlay, Stack, ModalContent, Select, Textarea, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, useDisclosure, useToast, Spacer, IconButton,
    Flex, VStack, InputGroup, InputRightElement, AvatarGroup, Badge, Divider, Spinner, useColorMode,
    Menu, MenuButton, MenuList, MenuItem, Progress, NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    TagCloseButton,
    Tag, TagLabel
} from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { FaPen, FaPlus, FaSearch, FaTrash } from 'react-icons/fa'
import { addProjectBoard, editProjectBoard, getProjectBoards } from '../api/projectBoard'
import { useForm } from 'react-hook-form'
import { BsThreeDots } from "react-icons/bs"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { AiFillCheckSquare } from "react-icons/ai"
import { addIssueToBoard, changeIssuePosition1, changeIssuePosition2, deleteIssueFromBoard } from '../api/issue'
import { FcHighPriority, FcLowPriority, FcMediumPriority } from "react-icons/fc"
import moment from "moment"
import 'moment/dist/locale/hu'
import { MultiSelect } from "chakra-multiselect"
import { ContentState, EditorState, convertFromHTML } from 'draft-js'
import { Editor } from 'react-draft-wysiwyg'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { convertToHTML, } from "draft-convert"
import DOMPurify from 'dompurify'
import { createEditor } from 'slate'
import { withReact } from 'slate-react'
import { useMemo } from 'react'
import debounce from "lodash/debounce"
import "../styles.css"

export default function ProjectBoards() {

    const { user } = useAuth()
    const { projectId } = useParams()
    const [project, setProject] = useState()
    const [boards, setBoards] = useState()

    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isOpenAddIssue, onOpen: onOpenAddIssue, onClose: onCloseAddIssue } = useDisclosure()
    const { isOpen: isOpenIssue, onOpen: onOpenIssue, onClose: onCloseIssue } = useDisclosure()
    const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure()
    const { isOpen: isOpenBoardEdit, onOpen: onOpenBoardEdit, onClose: onCloseBoardEdit } = useDisclosure()

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, formState: { errors: errorsEdit } } = useForm();

    const [currentIssue, setCurrentIssue] = useState()
    const [currentBoardId, setCurrentBoardId] = useState()
    const { colorMode } = useColorMode()

    const [assignedPeople, setAssignedPeople] = useState([])
    const [people, setPeople] = useState([])

    const toast = useToast()

    useEffect(() => {
        const fetchProject = async () => {
            const result = await getProjectById(projectId)
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
            const result = await getProjectBoards(projectId)
            setBoards(result.data)
        }
        fetchProjectBoards()
    }, [])

    const handleOpenIssue = (issueObject, boardId) => {
        setCurrentIssue(issueObject)
        setCurrentBoardId(boardId)

        const contentAsHTML = issueObject.description;
        const contentBl = convertFromHTML(contentAsHTML);
        const contentState = ContentState.createFromBlockArray(contentBl.contentBlocks, contentBl.entityMap);
        const newEditorState = EditorState.createWithContent(contentState);
        setEditorState(newEditorState)
        onOpenIssue()
    }

    const refreshBoards = async () => {
        const result = await getProjectBoards(projectId)
        setBoards(result.data)
    }

    const handleAddBoard = async (data) => {
        try {
            await addProjectBoard(project.id, { title: data.title, position: boards.length + 1 })
            toast({
                title: 'Board sikeresen létrehozva a projekthez.',
                description: "",
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
            refreshBoards()
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
    const handleOnDragEnd = async (result) => {
        if (!result.destination) {
            return;
        }
        // csere oszlopok között
        if (result.source.droppableId !== result.destination.droppableId) {
            const sourceColumn = boards.find((b) => b.id === result.source.droppableId);
            const destinationColumn = boards.find((b) => b.id === result.destination.droppableId);

            const sourceIndex = result.source.index;
            const destinationIndex = result.destination.index;

            const movedIssue = sourceColumn.issues[sourceIndex];

            // Távolítsuk el az elemet a forrás oszlopból
            sourceColumn.issues.splice(sourceIndex, 1);

            // Az elemet szúrjuk be a cél oszlopba
            destinationColumn.issues.splice(destinationIndex, 0, movedIssue);

            // Frissítsük a pozíciókat mindkét oszlopban
            for (let i = 0; i < sourceColumn.issues.length; i++) {
                sourceColumn.issues[i].position = i + 1;
            }

            for (let i = 0; i < destinationColumn.issues.length; i++) {
                destinationColumn.issues[i].position = i + 1;
            }

            // A poziciókat id-vel eltárolom Dict-be és elküldöm
            const sourcePositions = {};
            for (let i = 0; i < sourceColumn.issues.length; i++) {
                sourcePositions[sourceColumn.issues[i].id] = sourceColumn.issues[i].position;
            }

            const destPositions = {};
            for (let i = 0; i < destinationColumn.issues.length; i++) {
                destPositions[destinationColumn.issues[i].id] = destinationColumn.issues[i].position;
            }

            const newBoards = boards.map((item) => {
                if (item.id === sourceColumn.id) {
                    return sourceColumn;
                } else if (item.id === destinationColumn.id) {
                    return destinationColumn;
                } else {
                    return item;
                }
            });

            setBoards(newBoards)

            await changeIssuePosition2(projectId, result.source.droppableId, result.destination.droppableId,
                movedIssue.id, sourcePositions, destPositions)

        }
        // csere soron belül
        else {
            const column = boards.filter(b => b.id === result.source.droppableId)[0]

            const sourceIndex = result.source.index;
            const destinationIndex = result.destination.index;

            // Az összes elem pozíciójának frissítése a forrás és a cél közötti áthelyezés miatt
            const newIssues = [...column.issues];
            const [movedIssue] = newIssues.splice(sourceIndex, 1);
            newIssues.splice(destinationIndex, 0, movedIssue);

            // Frissítjük az összes elem pozícióját a helyes sorrend érdekében
            for (let i = 0; i < newIssues.length; i++) {
                newIssues[i].position = i + 1;
            }

            // A poziciókat id-vel eltárolom Dict-be és elküldöm

            const positions = {};
            for (let i = 0; i < newIssues.length; i++) {
                positions[newIssues[i].id] = newIssues[i].position;
            }

            // Az új elemekkel frissítjük a 'column' objektumot
            column.issues = newIssues;

            const newBoards = boards.map(item => {
                if (item.id === result.source.droppableId) {
                    return column
                } else {
                    return item
                }
            })
            setBoards(newBoards)
            await changeIssuePosition1(projectId, result.source.droppableId, JSON.stringify(positions))
        }
    }

    const [editorState, setEditorState] = useState(
        () => EditorState.createEmpty(),
    );
    const [search, setSearch] = useState("")

    const debouncedResults = useMemo(() => {
        return debounce(setSearch, 300);
    }, []);

    const debouncedResults2 = useMemo(() => {
        return debounce(setEditorState, 100);
    }, []);

    useEffect(() => {
        return () => {
            debouncedResults.cancel();
            debouncedResults2.cancel();
        };
    });

    const handleAddIssueOpen = (boardId) => {
        setCurrentBoardId(boardId)
        onOpenAddIssue()
    }

    const handleAddIssueForm = async (object) => {
        const contentState = editorState.getCurrentContent();
        const contentAsHTML = convertToHTML(contentState);

        // Legnagyobb position megkeresése
        const b = boards.filter(i => i.id === currentBoardId)[0].issues
        let maxPos = 0
        b.forEach(i => {
            if (i.position > maxPos)
                maxPos = i.position
        })

        // await addIssueToBoard(projectId, currentBoardId,
        //     { ...object, description: convertToHTML(editorState.getCurrentContent()), position: maxPos + 1 }, assignedPeople)
        await addIssueToBoard(projectId, currentBoardId,
            { ...object, description: contentAsHTML, position: maxPos + 1 }, assignedPeople, updateProjectBoards)
        toast({
            title: 'Issue sikeresen létrehozva!.',
            description: "",
            status: 'success',
            duration: 4000,
            isClosable: true,
        })
        onCloseAddIssue()
    }

    const handleAddIssueClose = () => {
        reset()
        setEditorState(EditorState.createEmpty())
        setAssignedPeople([])
        onCloseAddIssue()
    }

    const updateProjectBoards = async () => {
        const result = await getProjectBoards(projectId)
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

    const [title, setTitle] = useState("")

    const handleBoardEditOpen = (obj, obj2) => {
        setTitle(obj)
        setCurrentBoardId(obj2)
        onOpenBoardEdit()
    }

    const handleBoardEditClose = () => {
        setCurrentBoardId()
        resetEdit()
        setTitle("")
        onCloseBoardEdit()
    }

    const IsUserProjectOwner = (participants) => {
        if (participants.filter(i => i.userId === user.id && i.roleName === "Owner").length !== 0) {
            return true
        }
        return false
    }

    const handleBoardEdit = async (obj) => {
        try {
            const response = await editProjectBoard(projectId, currentBoardId, obj)
            toast({
                title: 'Board címe frissítve.',
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
            await updateProjectBoards()
            handleBoardEditClose()
        } catch (e) {
            toast({
                title: 'Sikertelen művelet.',
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
            handleBoardEditClose()
        }
    }

    const editor = useMemo(() => withReact(createEditor()), [])

    const [value, setValue] = useState([
        {
            type: 'paragraph',
            children: [{ text: 'I am a Slate rich editor.' }],
        },
    ])

    moment.locale('hu')

    if (project == null) {
        return <Flex h="100vh" w="full" align="center" justify="center">
            <Spinner size="xl" color="green.500" />
        </Flex>
    }
    else
        return (
            <>
                {/* Board létrehozása */}
                <Modal isOpen={isOpen} onClose={handleCloseAddBoard}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Board hozzáadása a projekthez</ModalHeader>
                        <ModalCloseButton />
                        <form autoComplete='off' onSubmit={handleSubmit(handleAddBoard)}>
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
                {/* Issue létrehozása */}
                <Modal size="3xl" isOpen={isOpenAddIssue} onClose={handleAddIssueClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Ügy létrehozása</ModalHeader>
                        <form autoComplete='off' onSubmit={handleSubmit(handleAddIssueForm)}>
                            <ModalBody>
                                <Stack spacing={5}>
                                    <FormControl isRequired>
                                        <FormLabel>Cím</FormLabel>
                                        <Input type="text" {...register("title", { required: true })} />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Leírás</FormLabel>
                                        {/* <ReactQuill onChange={(e) => setTxt(e)} /> */}
                                        <Editor
                                            editorStyle={{ border: "1px solid gray", minHeight: "250px", maxHeight: "500px", padding: 2 }}
                                            editorState={editorState}
                                            onEditorStateChange={setEditorState}
                                        />
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
                {/* Issue törlése */}
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
                {/* Issue megtekintése */}
                <Modal size="5xl" isOpen={isOpenIssue} onClose={onCloseIssue}>
                    <ModalOverlay />
                    {currentIssue ?
                        <ModalContent>
                            <ModalHeader>
                                <HStack>
                                    <AiFillCheckSquare color='#42a4ff' />
                                    <Text>{project.title} - {currentIssue.title}</Text>
                                </HStack>
                            </ModalHeader>
                            <IconButton onClick={onOpenDelete} size="sm" right={14} top={2} position={"absolute"} variant="ghost" icon={<FaTrash />} />
                            <ModalCloseButton />
                            <ModalBody>
                                <HStack gap="30px" align={"flex-start"}>
                                    <Flex w="60%" direction={"column"}>
                                        <FormControl>
                                            <Input mb={5} fontSize={"3xl"} variant={"filled"} defaultValue={currentIssue.title} />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Leírás</FormLabel>
                                            {/* <ReactQuill value={currentIssue.description} mb={5} /> */}
                                            <Editor
                                                toolbarClassName='rdw-editor-toolbar'
                                                editorStyle={{ minHeight: "250px", maxHeight: "500px", padding: 2 }}
                                                editorState={editorState}
                                                onEditorStateChange={debouncedResults2}
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Hozzászólások</FormLabel>
                                            <HStack align="baseline">
                                                <Avatar size="sm" name={currentIssue.reporterName} />
                                                <Textarea placeholder='Hozzászólás írása...' />
                                            </HStack>
                                        </FormControl>
                                    </Flex>
                                    <Stack gap={2}>
                                        <FormLabel>Státusz</FormLabel>
                                        <Select variant={"filled"} size={"md"} defaultValue={currentBoardId}>
                                            {boards.map((j, k) => {
                                                return <option key={k} value={j.id}>{j.title}</option>
                                            })}
                                        </Select>
                                        <FormControl>
                                            <FormLabel>Hozzárendelt személyek</FormLabel>
                                            {currentIssue.assignedPeople.length > 0 ? currentIssue.assignedPeople.map((i, k) => {
                                                return <Tag size="lg" borderRadius={"full"}>
                                                    <Avatar key={k} ml={-1} mr={2} size="xs" name={`${i.personName}`} />
                                                    <TagLabel>{i.personName}</TagLabel>
                                                    <TagCloseButton />
                                                </Tag>
                                            }) : "Nincs hozzárendelve."}
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Bejelentő</FormLabel>
                                            <Tag borderRadius={"full"} size="lg">
                                                <Avatar ml={-1} mr={2} name={currentIssue.reporterName} size="xs" />
                                                <TagLabel>{currentIssue.reporterName}</TagLabel>
                                            </Tag>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Prioritás</FormLabel>
                                            <HStack p={2} borderRadius={7} bg={colorMode === 'dark' ? "#353f4f" : "#edf2f7"} align="center">
                                                {handlePriorityIcon(currentIssue.priority)}
                                                <Text>{currentIssue.priority.name}</Text>
                                            </HStack>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Feladatra becsült idő (órában)</FormLabel>
                                            <NumberInput variant={"filled"} defaultValue={currentIssue.timeEstimate} min={1} max={24}>
                                                <NumberInputField />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Befektetett idő (órában)</FormLabel>
                                            <Stack>
                                                <Progress value={0} />
                                                <HStack>
                                                    <Text>{currentIssue.timeSpent} óra</Text>
                                                    <Spacer />
                                                    <Text>{currentIssue.timeEstimate} órából</Text>
                                                </HStack>
                                            </Stack>
                                        </FormControl>
                                        <FormLabel mb={0}>Határidő (dátum)</FormLabel>
                                        <Text>{currentIssue.dueDate ? moment(currentIssue.dueDate).format("yyyy/MM/DD") : "Nincs megadva"}</Text>
                                        <Divider />
                                        <Text>Létrehozva: {moment(currentIssue.created).fromNow()}</Text>
                                        <Text>Frissítve: {moment(currentIssue.updated).fromNow()}</Text>
                                    </Stack>
                                </HStack>
                            </ModalBody>
                        </ModalContent>
                        : ""}
                </Modal>
                {/* Board név módosítása */}
                <Modal isOpen={isOpenBoardEdit} onClose={handleBoardEditClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>
                            <Text>Board nevének módosítása</Text>
                        </ModalHeader>
                        <ModalCloseButton />
                        <form autoComplete='off' onSubmit={handleSubmitEdit(handleBoardEdit)}>
                            <ModalBody>
                                <FormControl isInvalid={errorsEdit.title}>
                                    <FormLabel>Tábla neve</FormLabel>
                                    <Input defaultValue={title} {...registerEdit("title", { required: true })} type="text" />
                                    {errorsEdit.title ? <FormErrorMessage>Kérem adja meg a tábla címét.</FormErrorMessage> : ""}
                                </FormControl>
                            </ModalBody>
                            <ModalFooter>
                                <Button type="submit" colorScheme='blue' mr={3} variant='solid'>Hozzárendel</Button>
                                <Button onClick={handleBoardEditClose}>
                                    Visszavonás
                                </Button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
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
                            <Input onChange={debouncedResults} type='text' placeholder='Feladat keresése...' />
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
                                            <Text noOfLines={"1"} textTransform={"uppercase"}>{i.title}</Text>
                                        </Tooltip>
                                        <Text>{i.issues.length}</Text>
                                        <Spacer />
                                        <Menu>
                                            <MenuButton
                                                isDisabled={IsUserProjectOwner(project.participants) ? false : true}
                                                as={IconButton}
                                                aria-label='Options'
                                                icon={<BsThreeDots />}
                                                variant='outline'
                                            />
                                            <MenuList>
                                                <MenuItem icon={<FaTrash />}>
                                                    Board törlése
                                                </MenuItem>
                                                <MenuItem onClick={() => handleBoardEditOpen(i.title, i.id)} icon={<FaPen />}>
                                                    Board átnevezése
                                                </MenuItem>
                                            </MenuList>
                                        </Menu>
                                    </HStack>
                                    <Flex as={Button} gap={2} onClick={() => handleAddIssueOpen(i.id)} _hover={{ cursor: "pointer", bg: "gray.100" }} bg={colorMode === 'light' ? "white" : '#333'} align="center" borderRadius={5} p={1} justify={"center"}>
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
                                                                <VStack _hover={{ bg: (colorMode === 'light' ? "gray.100" : "gray.500"), cursor: 'pointer' }} onClick={() => handleOpenIssue(issue, i.id)} ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps} key={key} bg={colorMode === 'light' ? "white" : '#333'} align="center" borderRadius={5} p={1} justify={"center"}>
                                                                    <Text>{issue.title} {issue.position}</Text>
                                                                    <HStack w={"full"}>
                                                                        <AiFillCheckSquare color='#42a4ff' />
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
