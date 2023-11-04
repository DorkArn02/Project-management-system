import React from 'react'
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
    Breadcrumb, Icon,
    BreadcrumbItem,
    Editable,
    EditablePreview,
    BreadcrumbLink,
    HStack, Avatar,
    Text, Tooltip, Button, Input, FormLabel, FormErrorMessage,
    Modal, ModalOverlay, Stack, ModalContent, Select, Textarea, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, useDisclosure, useToast, Spacer, IconButton,
    Flex, InputGroup, InputRightElement, AvatarGroup, Divider, Spinner, useColorMode,
    Menu, MenuButton, MenuList, MenuItem, Progress, NumberInput,
    NumberInputField,
    Tag, TagLabel, EditableInput, Heading, Box
} from '@chakra-ui/react'
import {
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    SliderMark,
} from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { FaClock, FaPen, FaPlus, FaSave, FaSearch, FaTrash, FaUser, FaUsers } from 'react-icons/fa'
import { ImCross } from "react-icons/im"
import { addProjectBoard, deleteProjectBoard, editProjectBoard, editProjectBoardPosition } from '../api/projectBoard'
import { Controller, useForm } from 'react-hook-form'
import { BsBarChartFill, BsChatLeftTextFill, BsFillCalendarDateFill, BsTextParagraph, BsThreeDots } from "react-icons/bs"
import { DragDropContext, Droppable } from "react-beautiful-dnd"
import { AiFillCheckSquare } from "react-icons/ai"
import { addIssueToBoard, changeIssue, changeIssuePosition1, changeIssuePosition2, deleteIssueFromBoard } from '../api/issue'
import { FcHighPriority, FcLowPriority, FcMediumPriority } from "react-icons/fc"
import moment from "moment"
import 'moment/dist/locale/hu'
import { useMemo } from 'react'
import debounce from "lodash/debounce"
import "../styles.css"
import Issue from './IssueComponents/Issue'
import { Select as ChakraSelect, chakraComponents } from "chakra-react-select"
import EditorComp from './EditorComp'
import { addCommentToIssue } from '../api/comment'
import EditableControls from './EditableControl'
import { useLoaderData } from 'react-router-dom'
import { useNavigation } from 'react-router-dom'
import { useRevalidator } from 'react-router-dom'
import { MdInfo, MdNumbers } from "react-icons/md"
import { useRef } from 'react'
// import '@mdxeditor/editor/style.css'
// import { MDXEditor } from '@mdxeditor/editor/MDXEditor'
// import { UndoRedo } from '@mdxeditor/editor/plugins/toolbar/components/UndoRedo'
// import { BoldItalicUnderlineToggles } from '@mdxeditor/editor/plugins/toolbar/components/BoldItalicUnderlineToggles'
// import { toolbarPlugin } from '@mdxeditor/editor/plugins/toolbar'
// import { CodeToggle } from '@mdxeditor/editor/plugins/toolbar/components/CodeToggle'
// import { ListsToggle } from '@mdxeditor/editor/plugins/toolbar/components/ListsToggle'
// import { headingsPlugin } from '@mdxeditor/editor/plugins/headings'
// import { listsPlugin } from '@mdxeditor/editor/plugins/lists'
// import { BlockTypeSelect } from '@mdxeditor/editor/plugins/toolbar/components/BlockTypeSelect'

// PRIORITY SELECT ICONS
const customComponents = {
    Option: ({ children, ...props }) => (
        <chakraComponents.Option {...props}>
            {props.data.icon} {children}
        </chakraComponents.Option>
    ),
};

export default function ProjectBoards() {

    // AUTH
    const { user } = useAuth()

    // REACT ROUTER
    const { projectId } = useParams()
    const [project, boards] = useLoaderData()
    const navigation = useNavigation()
    const revalidator = useRevalidator()

    // STATES
    const [currentIssue, setCurrentIssue] = useState()
    const [currentBoardId, setCurrentBoardId] = useState()
    const [assignedPeople, setAssignedPeople] = useState([])
    const [people, setPeople] = useState([])
    const [search, setSearch] = useState("");
    const [title, setTitle] = useState("")
    const [priority, setPriority] = useState(null) // filter off when state null
    const [selectedPeople, setSelectedPeople] = useState([])
    const [comment, setComment] = useState("")
    const [otherBoards, setOtherBoards] = useState([])

    const [slide, setSlide] = useState(0)
    const [commenting, setCommenting] = useState(0)
    const formRef = useRef()

    useEffect(() => {
        const arr = []
        const arr2 = []
        project.participants.forEach(item => {
            arr.push({ id: item.userId, label: `${item.lastName} ${item.firstName}`, participantId: `${item.id}`, value: `${item.userId}` })
            arr2.push({ id: item.userId, label: `${item.lastName} ${item.firstName}`, selected: false })
        })
        setPeople(arr)
        setSelectedPeople(arr2)
    }, [project, boards])

    // CHAKRA
    const { colorMode } = useColorMode()
    const toast = useToast()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isOpenAddIssue, onOpen: onOpenAddIssue, onClose: onCloseAddIssue } = useDisclosure()
    const { isOpen: isOpenIssue, onOpen: onOpenIssue, onClose: onCloseIssue } = useDisclosure()
    const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure()
    const { isOpen: isOpenBoardEdit, onOpen: onOpenBoardEdit, onClose: onCloseBoardEdit } = useDisclosure()
    const { isOpen: isOpenBoardDelete, onOpen: onOpenBoardDelete, onClose: onCloseBoardDelete } = useDisclosure()
    const { isOpen: isOpenBoardEditPos, onOpen: onOpenBoardEditPos, onClose: onCloseBoardEditPos } = useDisclosure()

    // REACT HOOK FORM
    const { register: registerBoardCreate, handleSubmit: handleSubmitBoardCreate, reset: resetBoardCreate, formState: { errors: errorsBoardCreate, isSubmitting: isSubmittingBoardCreate } } = useForm();
    const { register: registerIssueCreate, handleSubmit: handleSubmitIssueCreate, reset: resetIssueCreate, formState: { errors: errorsIssueCreate, isSubmitting: isSubmittingIssueCreate }, control: controlIssueCreate } = useForm();
    const { register: registerBoardEdit, handleSubmit: handleSubmitBoardEdit, reset: resetBoardEdit, formState: { errors: errorsBoardEdit, isSubmitting: isSubmittingBoardEdit } } = useForm();
    const { register: registerView, handleSubmit: handleSubmitView, reset: resetView, formState: { errors: errorsView, isDirty, dirtyFields }, control: controlView } = useForm({
        shouldUnregister: true
    });
    const { handleSubmit: handleSubmitDelete, formState: { isSubmitting: isSubmittingDelete } } = useForm()
    const { register: registerComment, handleSubmit: handleSubmitComment, reset: resetComment } = useForm()
    const { register: registerBoardEditPos, handleSubmit: handleSubmitBoardEditPos, reset: resetBoardEditPos, formState: { errors: errorsBoardEditPos, isSubmitting: isSubmittingBoardEditPos } } = useForm();


    const priorities = [
        { value: "1", label: "Legalacsonyabb", icon: <Icon mr={2} as={FcLowPriority} /> },
        { value: "2", label: "Alacsony", icon: <Icon mr={2} as={FcLowPriority} /> },
        { value: "3", label: "Közepes", icon: <Icon mr={2} as={FcMediumPriority} /> },
        { value: "4", label: "Magas", icon: <Icon mr={2} as={FcHighPriority} /> },
        { value: "5", label: "Legmagasabb", icon: <Icon mr={2} as={FcHighPriority} /> },
    ]

    // FUNCTIONS
    const handleOpenIssue = (issueObject, boardId) => {
        setCurrentIssue(issueObject)
        setCurrentBoardId(boardId)
        const arr = []
        project.participants.map(p => {
            if (issueObject.assignedPeople.some(a => a.userId === p.userId)) {
                arr.push({ id: p.userId, label: `${p.lastName} ${p.firstName}`, value: `${p.userId}` })
            }
        })
        setSlide(issueObject.timeSpent)
        setAssignedPeople(arr)
        onOpenIssue()
    }

    const refreshBoards = () => {
        revalidator.revalidate();
    }

    const handleAddBoard = async (data) => {
        try {
            await addProjectBoard(project.id, { title: data.title, position: boards.length + 1 })
            toast({
                title: 'Board sikeresen létrehozva a projekthez.',
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
            refreshBoards()
            handleCloseAddBoard()
        } catch (e) {
            toast({
                title: 'Hiba történt a board hozzáadása közben...',
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
            handleCloseAddBoard()
        }
    }

    const handleCloseAddBoard = () => {
        resetBoardCreate()
        onClose()
    }

    const handleDeleteIssue = async () => {
        try {
            await deleteIssueFromBoard(projectId, currentBoardId, currentIssue.id)
            toast({
                title: 'Issue sikeresen törölve!.',
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

            await changeIssuePosition2(projectId, result.source.droppableId, result.destination.droppableId,
                movedIssue.id, sourcePositions, destPositions)
            revalidator.revalidate()
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
            await changeIssuePosition1(projectId, result.source.droppableId, JSON.stringify(positions))
            revalidator.revalidate()

        }
    }

    const changeHandler = event => {
        setSearch(event.target.value);
    };

    const debouncedChangeHandler = useMemo(
        () => debounce(changeHandler, 300)
        , []);

    const commentHandler = event => {
        setComment(event.target.value)
    }

    const debouncedCommentHandler = useMemo(
        () => debounce(commentHandler, 300)
        , []);


    useEffect(() => {
        return () => {
            debouncedChangeHandler.cancel();
        }
    }, []);

    const handleAddIssueOpen = (boardId) => {
        setCurrentBoardId(boardId)
        onOpenAddIssue()
    }

    const handleAddIssueForm = async (object) => {

        const b = boards.filter(i => i.id === currentBoardId)[0].issues
        let maxPos = 0
        b.forEach(i => {
            if (i.position > maxPos)
                maxPos = i.position
        })

        if (object.assignedPeople) {
            const aPeople = object.assignedPeople.map(a => {
                return a.participantId
            })
            await addIssueToBoard(projectId, currentBoardId,
                { ...object, description: JSON.stringify(object.description), priorityId: object.priorityId.value, position: maxPos + 1 }, aPeople, updateProjectBoards)
        }
        else {
            await addIssueToBoard(projectId, currentBoardId,
                { ...object, description: JSON.stringify(object.description), priorityId: object.priorityId.value, position: maxPos + 1 }, null, updateProjectBoards)
        }

        toast({
            title: 'Issue sikeresen létrehozva!.',
            description: "",
            status: 'success',
            duration: 4000,
            isClosable: true,
        })
        updateProjectBoards()
        onCloseAddIssue()
    }

    const handleAddIssueClose = () => {
        resetIssueCreate()
        setAssignedPeople([])
        onCloseAddIssue()
    }

    const updateProjectBoards = () => {
        revalidator.revalidate()
    }

    const handlePriorityIcon = (priority) => {
        if (priority.name === "Alacsony") {
            return <FcLowPriority color={priority.color} />
        }
        else if (priority.name === "Közepes") {
            return <FcMediumPriority color={priority.color} />
        }
        else if (priority.name === "Magas") {
            return <FcHighPriority color={priority.color} />
        }
        else if (priority.name === "Legalacsonyabb") {
            return <FcLowPriority color={priority.color} />
        }
        else if (priority.name === "Legmagasabb") {
            return <FcHighPriority color={priority.color} />
        }
    }

    const handleBoardEditOpen = (obj, obj2) => {
        setTitle(obj)
        setCurrentBoardId(obj2)
        onOpenBoardEdit()
    }

    const handleBoardEditPosOpen = (obj) => {
        setCurrentBoardId(obj)

        const elements = boards.filter(i => i.id !== obj)
        setOtherBoards(elements)

        onOpenBoardEditPos()
    }

    const handleBoardDeleteOpen = (boardId) => {
        setCurrentBoardId(boardId)
        onOpenBoardDelete()
    }

    const handleBoardDelete = async () => {
        try {
            const result = await deleteProjectBoard(projectId, currentBoardId)
            toast({
                title: 'Board törölve.',
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
            updateProjectBoards()
            onCloseBoardDelete()
        } catch (e) {
            toast({
                title: 'Board törlése sikertelen.',
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
            onCloseBoardDelete()
        }
    }

    const handleBoardEditClose = () => {
        setCurrentBoardId()
        resetBoardEdit()
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
            updateProjectBoards()
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

    const handleOnCloseIssue = async (e) => {
        setCommenting(0)
        setComment(0)
        resetView()
        setSlide(0)
        if (isDirty) {
            const patchData = [];
            for (const key in dirtyFields) {
                if (dirtyFields.hasOwnProperty(key) && dirtyFields[key]) {
                    if (key === "description") {
                        patchData.push({
                            op: 'replace',
                            path: `/${key}`,
                            value: JSON.stringify(e[key])
                        })
                    } else if (key === "priorityId") {
                        patchData.push({
                            op: 'replace',
                            path: `/${key}`,
                            value: e[key].value
                        })
                    } else if (key === "assignedPeople") {
                        const tmp = []
                        for (let data of e[key]) {
                            tmp.push({ userId: data.id, issueId: currentIssue.id })
                        }
                        patchData.push({
                            op: 'replace',
                            path: `/${key}`,
                            value: tmp
                        })
                    }
                    else {
                        patchData.push({
                            op: 'replace',
                            path: `/${key}`,
                            value: e[key]
                        })
                    }
                }
            }

            await changeIssue(projectId, currentBoardId, currentIssue.id, patchData)
            updateProjectBoards()
            toast({
                title: 'Feladat leírása sikeresen módosítva.',
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
        }
        setAssignedPeople([])
        onCloseIssue()
    }

    const handleFilterPeople = (id) => {
        const items = [...selectedPeople]

        const result = items.map(i => {
            if (i.id === id) {
                return { ...i, selected: !i.selected }
            } else {
                return i;
            }
        });

        setSelectedPeople(result)
    }

    const handlePriorityFilter = (e) => {
        if (e)
            setPriority(e.value)
        else
            setPriority(null)
    }

    const handleComment = async () => {
        try {
            await addCommentToIssue(projectId, currentIssue.id, comment)

            toast({
                title: 'Hozzászólás sikeresen hozzáadva a feladathoz.',
                status: 'success',
                duration: 4000,
                isClosable: true,
            })

            updateProjectBoards()
            handleOnCloseIssue()
        } catch (e) {
            toast({
                title: 'Hozzászólás rögzítése sikertelen.',
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
            handleOnCloseIssue()
        }
    }

    const handleEditComment = () => {
        alert("LOL")
    }

    const handleCloseBoardEditPos = () => {
        resetBoardEditPos()
        onCloseBoardEditPos()
    }

    const handleBoardPosition = async (obj) => {
        try {
            await editProjectBoardPosition(projectId, currentBoardId, obj.boardId)
            toast({
                title: 'Board pozíciója sikeresen módosult.',
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
            updateProjectBoards()
            handleCloseBoardEditPos()
        } catch (e) {
            toast({
                title: 'Hiba történt a módosítás során.',
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
            handleCloseBoardEditPos()
        }
    }
    moment.locale('hu')

    if (navigation.state === 'loading') {
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
                        <form autoComplete='off' onSubmit={handleSubmitBoardCreate(handleAddBoard)}>
                            <ModalBody>
                                <FormControl isInvalid={errorsBoardCreate.title}>
                                    <FormLabel>Tábla neve</FormLabel>
                                    <Input {...registerBoardCreate("title", { required: true })} type="text" />
                                    {errorsBoardCreate.title ? <FormErrorMessage>Kérem adja meg a tábla címét.</FormErrorMessage> : ""}
                                </FormControl>
                            </ModalBody>
                            <ModalFooter>
                                <Button isLoading={isSubmittingBoardCreate} type="submit" colorScheme='blue' mr={3} variant='solid'>Hozzárendel</Button>
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
                        <ModalCloseButton />
                        <ModalHeader>Ügy létrehozása</ModalHeader>
                        <form autoComplete='off' onSubmit={handleSubmitIssueCreate(handleAddIssueForm)}>
                            <ModalBody>
                                <Stack spacing={5}>
                                    <FormControl isInvalid={errorsIssueCreate.title}>
                                        <FormLabel>Cím</FormLabel>
                                        <Input variant={"filled"} type="text" {...registerIssueCreate("title", { required: true })} />
                                        <FormErrorMessage>{errorsIssueCreate.title ? "Kérem írjon be címet." : ""}</FormErrorMessage>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Leírás</FormLabel>
                                        <Controller name="description" rules={{ required: false }} control={controlIssueCreate}
                                            render={({ field: { value, onChange } }) => (
                                                <EditorComp data={value} setData={onChange} />
                                            )} />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Személyek hozzárendelése</FormLabel>
                                        {project &&
                                            <Controller name="assignedPeople" rules={{ required: false }} control={controlIssueCreate}
                                                render={({ field: { value, onChange } }) => (
                                                    <ChakraSelect isMulti={true} placeholder="Személyek hozzárendelése" isClearable={true} variant='filled' options={people} components={customComponents} onChange={onChange} value={value}>
                                                    </ChakraSelect>
                                                )} />

                                        }
                                    </FormControl>
                                    <FormControl isInvalid={errorsIssueCreate.priorityId}>
                                        <FormLabel>Prioritás</FormLabel>
                                        <Controller name="priorityId" rules={{ required: true }} control={controlIssueCreate} render={({ field: { value, onChange } }) => (
                                            <ChakraSelect placeholder="Szűrés prioritás szerint..." isClearable={true} variant='filled' options={priorities} components={customComponents} onChange={onChange} value={value}>
                                            </ChakraSelect>
                                        )} />
                                        <FormErrorMessage>{errorsIssueCreate.priorityId ? "Kérem válasszon ki prioritást." : ""}</FormErrorMessage>
                                    </FormControl>
                                    <FormControl isInvalid={errorsIssueCreate.timeEstimate}>
                                        <FormLabel>Becsült idő (óra)</FormLabel>
                                        <Input variant={"filled"}  {...registerIssueCreate("timeEstimate", { required: false, valueAsNumber: true, validate: (value) => value >= 1 })} type="number" />
                                        <FormErrorMessage>{errorsIssueCreate.timeEstimate ? "0-tól nagyobb számot adjon meg." : ""}</FormErrorMessage>
                                    </FormControl>
                                    <FormControl isInvalid={errorsIssueCreate.dueDate}>
                                        <FormLabel>Határidő</FormLabel>
                                        <Input variant={"filled"} {...registerIssueCreate("dueDate", { required: false, valueAsDate: true, validate: (value) => value > Date.now() })} type="date" />
                                        <FormErrorMessage>{errorsIssueCreate.timeEstimate ? "A határidőnek nagyobbnak kell lennie, mint ma" : ""}</FormErrorMessage>
                                    </FormControl>
                                </Stack>
                            </ModalBody>
                            <ModalFooter>
                                <Button isLoading={isSubmittingIssueCreate} mr={3} type="submit" colorScheme='blue'>Létrehozás</Button>
                                <Button onClick={handleAddIssueClose}>Visszavonás</Button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </Modal >
                {/* Issue törlése */}
                <Modal isOpen={isOpenDelete} onClose={onCloseDelete} >
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
                            <form onSubmit={handleSubmitDelete(handleDeleteIssue)}>
                                <Button type="submit" isLoading={isSubmittingDelete} colorScheme='blue' mr={2}>Törlés</Button>
                                <Button onClick={onCloseDelete}>Visszavonás</Button>
                            </form>
                        </ModalFooter>
                    </ModalContent>
                </Modal >
                {/* Issue megtekintése */}
                <Modal closeOnOverlayClick={true} size="5xl" isOpen={isOpenIssue} onClose={() => {
                    formRef.current.requestSubmit()
                }
                }>
                    <ModalOverlay />
                    {
                        currentIssue ?
                            <ModalContent>
                                <form ref={formRef} autoComplete='off' onSubmit={handleSubmitView(handleOnCloseIssue)}>
                                    <ModalHeader>
                                        <HStack align={"center"}>
                                            <AiFillCheckSquare size={25} color='#42a4ff' />
                                            <FormControl mt={1}>
                                                <Editable selectAllOnFocus={false} maxW={"90%"} defaultValue={currentIssue.title}>
                                                    <EditablePreview />
                                                    <EditableInput {...registerView("title", { required: true })} />
                                                </Editable>
                                            </FormControl>
                                        </HStack>
                                    </ModalHeader>
                                    <IconButton onClick={onOpenDelete} size="md" right={14} top={5} position={"absolute"} variant="solid" icon={<FaTrash />} />
                                    <IconButton type="submit" size="md" right={2} top={5} position={"absolute"} variant="solid" icon={<ImCross />} />
                                    <ModalBody>
                                        <HStack gap="30px" align={"flex-start"}>
                                            <Flex maxH="100vh" overflowX={"hidden"} overflowY={"auto"} w="full" direction={"column"}>
                                                <FormControl p={2}>
                                                    <FormLabel>
                                                        <HStack>
                                                            <BsTextParagraph size={20} />
                                                            <Heading size="md">Leírás</Heading>
                                                        </HStack>
                                                    </FormLabel>
                                                    {/* <MDXEditor markdown='Hello world' plugins={
                                                        [toolbarPlugin({
                                                            toolbarContents: () => (<> <UndoRedo /><BoldItalicUnderlineToggles /> <CodeToggle /><ListsToggle /><BlockTypeSelect /></>)
                                                        }), headingsPlugin(), listsPlugin()]

                                                    } /> */}

                                                    <Controller defaultValue={currentIssue.description ? JSON.parse(currentIssue.description) : ""}
                                                        name='description' control={controlView} render={({ field: { value, onChange } }) => (
                                                            <Box >
                                                                <EditorComp data={value} setData={onChange} />
                                                            </Box>
                                                        )}
                                                    />
                                                </FormControl>
                                                <FormControl p={3}>
                                                    <FormLabel>
                                                        <HStack>
                                                            <BsChatLeftTextFill size={20} />
                                                            <Heading size="md">Hozzászólások ({currentIssue.comments.length})</Heading>
                                                        </HStack>
                                                    </FormLabel>
                                                    <HStack mb={3} align="baseline">
                                                        <Avatar size="sm" name={currentIssue.reporterName} />
                                                        <Textarea onFocus={() => setCommenting(1)} onChange={debouncedCommentHandler} placeholder='Hozzászólás írása...' />
                                                    </HStack>
                                                    {commenting ? <>
                                                        <Button mb={5} ml={10} onClick={handleComment} colorScheme='blue'>Elküldés</Button>
                                                        <Button mb={5} ml={5} onClick={() => { setCommenting(0) }} colorScheme='gray'>Visszavonás</Button></> : ""}
                                                </FormControl>
                                                {currentIssue.comments.map((c, k) => {
                                                    return <>
                                                        <Stack p={3} key={k} gap={1} >
                                                            <HStack >
                                                                <Avatar size="sm" name={c.authorName} />
                                                                <Text fontWeight={"medium"}>{c.authorName} </Text>
                                                                <Text>{moment(c.created).fromNow()}</Text>
                                                            </HStack>
                                                            <HStack pl={"40px"}>
                                                                <form onSubmit={handleSubmitComment()}>
                                                                    <Editable

                                                                        defaultValue={c.content}
                                                                        isPreviewFocusable={false}
                                                                    >
                                                                        <EditablePreview />
                                                                        <Input {...registerComment("content", { required: true })} mb={2} as={EditableInput} />
                                                                        {c.userId === user.id ? <EditableControls handleEditComment={handleEditComment} /> : ""}
                                                                    </Editable>
                                                                </form>
                                                            </HStack>
                                                        </Stack>
                                                        <Divider mt={2} mb={2} />
                                                    </>
                                                })}
                                            </Flex>
                                            <Stack p={3} w="400px" gap={2}>
                                                <FormControl>
                                                    <FormLabel>
                                                        <HStack>
                                                            <MdInfo />
                                                            <Text>Státusz</Text>
                                                        </HStack>
                                                    </FormLabel>
                                                    <Select {...registerView("projectListId", { required: true })} variant={"filled"} size={"md"} defaultValue={currentBoardId}>
                                                        {boards.map((j, k) => {
                                                            return <option key={k} value={j.id}>{j.title}</option>
                                                        })}
                                                    </Select>
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>
                                                        <HStack>
                                                            <FaUsers />
                                                            <Text>Hozzárendelt személyek</Text>
                                                        </HStack>
                                                    </FormLabel>                                                    <Controller defaultValue={assignedPeople} name="assignedPeople" rules={{ required: false }} control={controlView}
                                                        render={({ field: { value, onChange } }) => (
                                                            <>

                                                                <ChakraSelect isMulti={true} placeholder="Személyek hozzárendelése" isClearable={true} variant='filled' options={people} components={customComponents} onChange={onChange} value={value}>
                                                                </ChakraSelect>
                                                            </>
                                                        )} />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>
                                                        <HStack>
                                                            <FaUser />
                                                            <Text>Bejelentő</Text>
                                                        </HStack>
                                                    </FormLabel>
                                                    <Tag borderRadius={"full"} size="lg">
                                                        <Avatar ml={-1} mr={2} name={currentIssue.reporterName} size="xs" />
                                                        <TagLabel>{currentIssue.reporterName}</TagLabel>
                                                    </Tag>
                                                </FormControl>
                                                <FormControl zIndex={100} isInvalid={errorsView.priorityId} >
                                                    <FormLabel>
                                                        <HStack>
                                                            <BsBarChartFill />
                                                            <Text>Prioritás</Text>
                                                        </HStack>
                                                    </FormLabel>
                                                    <Controller defaultValue={{ value: `${currentIssue.priority.id}`, label: `${currentIssue.priority.name}` }} name="priorityId" rules={{ required: true }} control={controlView}
                                                        render={({ field: { value, onChange } }) => (
                                                            <>
                                                                <ChakraSelect placeholder={"Prioritás kiválasztása"} isClearable={true} variant='filled' options={priorities} components={customComponents} onChange={onChange} value={value}>
                                                                </ChakraSelect>
                                                            </>
                                                        )} />
                                                    <FormErrorMessage>{errorsView.priorityId ? "Kérem válasszon ki prioritást." : ""}</FormErrorMessage>
                                                </FormControl>
                                                <FormControl isInvalid={errorsView.timeEstimate}>
                                                    <FormLabel>
                                                        <HStack>
                                                            <FaClock />
                                                            <Text>Feladatra becsült idő (órában)</Text>
                                                        </HStack>
                                                    </FormLabel>                                                    <NumberInput step={1} defaultValue={currentIssue.timeEstimate} variant={"filled"}>
                                                        <NumberInputField {...registerView("timeEstimate", { required: false, valueAsNumber: true, validate: (value) => value >= 1 })} />
                                                    </NumberInput>
                                                    <FormErrorMessage>{errorsView.timeEstimate ? "0-tól nagyobb számot adjon meg." : ""}</FormErrorMessage>
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>
                                                        <HStack>
                                                            <FaClock />
                                                            <Text>Befektetett idő (órában)</Text>
                                                        </HStack>
                                                    </FormLabel>
                                                    <Stack >
                                                        <Controller defaultValue={currentIssue.timeSpent ? currentIssue.timeSpent : 0} name="timeSpent" rules={{ required: false }} control={controlView}
                                                            render={({ field: { value, onChange } }) => (
                                                                <>
                                                                    <Slider onChangeEnd={(e) => setSlide(e)} onChange={onChange} min={0} max={currentIssue.timeEstimate} aria-label='slider-ex-1' value={value}>
                                                                        <SliderTrack>
                                                                            <SliderFilledTrack />
                                                                        </SliderTrack>
                                                                        <SliderThumb />
                                                                    </Slider>
                                                                </>
                                                            )} />

                                                        <HStack>
                                                            <Text>{slide ? slide : "0"} óra</Text>
                                                            <Spacer />
                                                            <Text>{currentIssue.timeEstimate} órából</Text>
                                                        </HStack>
                                                    </Stack>
                                                </FormControl>
                                                <FormControl isInvalid={errorsView.dueDate}>
                                                    <FormLabel>
                                                        <HStack>
                                                            <BsFillCalendarDateFill />
                                                            <Text>Határidő (dátum)</Text>
                                                        </HStack>
                                                    </FormLabel>
                                                    <Input color={moment(currentIssue.dueDate).isBefore(Date.now()) ? "#e88374" : "lightgreen"} variant={"filled"} defaultValue={moment(currentIssue.dueDate).format("yyyy-MM-DD")} {...registerView("dueDate", { required: false, valueAsDate: true })} type="date" />
                                                    <FormErrorMessage>{errorsView.dueDate ? "A határidőnek nagyobbnak kell lennie, mint ma" : ""}</FormErrorMessage>
                                                </FormControl>
                                                <Divider />
                                                <Text>Létrehozva: {moment(currentIssue.created).fromNow()}</Text>
                                                <Text>Frissítve: {moment(currentIssue.updated).fromNow()}</Text>
                                            </Stack>
                                        </HStack>
                                    </ModalBody>
                                </form>
                            </ModalContent>
                            : ""
                    }
                </Modal >
                {/* Board név módosítása */}
                < Modal isOpen={isOpenBoardEdit} onClose={handleBoardEditClose} >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>
                            <Text>Board nevének módosítása</Text>
                        </ModalHeader>
                        <ModalCloseButton />
                        <form autoComplete='off' onSubmit={handleSubmitBoardEdit(handleBoardEdit)}>
                            <ModalBody>
                                <FormControl isInvalid={errorsBoardEdit.title}>
                                    <FormLabel>Tábla neve</FormLabel>
                                    <Input defaultValue={title} {...registerBoardEdit("title", { required: true })} type="text" />
                                    {errorsBoardEdit.title ? <FormErrorMessage>Kérem adja meg a tábla címét.</FormErrorMessage> : ""}
                                </FormControl>
                            </ModalBody>
                            <ModalFooter>
                                <Button isLoading={isSubmittingBoardEdit} type="submit" colorScheme='blue' mr={3} variant='solid'>Hozzárendel</Button>
                                <Button onClick={handleBoardEditClose}>
                                    Visszavonás
                                </Button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </Modal >
                {/* Board törlése */}
                < Modal isOpen={isOpenBoardDelete} onClose={onCloseBoardDelete} >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>
                            <Text>Board törlés megerősítése</Text>
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            Biztosan törli?
                        </ModalBody>
                        <ModalFooter>
                            <form onSubmit={handleSubmitDelete(handleBoardDelete)}>
                                <Button mr={3} onClick={onCloseBoardDelete}>
                                    Visszavonás
                                </Button>
                                <Button colorScheme='blue' type="submit" isLoading={isSubmittingDelete} variant='solid'>Törlés</Button>
                            </form>
                        </ModalFooter>
                    </ModalContent>
                </Modal >
                {/* Board pozíció módosítása */}
                < Modal isOpen={isOpenBoardEditPos} onClose={handleCloseBoardEditPos} >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>
                            <Text>Board pozíció módosítása</Text>
                        </ModalHeader>
                        <ModalCloseButton />
                        <form onSubmit={handleSubmitBoardEditPos(handleBoardPosition)}>
                            <ModalBody>
                                <Text mb={5}>Válassza ki azt a board-ot, amelyet kicserélne az aktuálissal</Text>
                                <Select {...registerBoardEditPos("boardId", { required: true })}>
                                    {otherBoards.map((i, k) => {
                                        return <option key={k} value={i.id}>{i.title}</option>
                                    })}
                                </Select>
                            </ModalBody>
                            <ModalFooter>
                                <Button isLoading={isSubmittingBoardEditPos} type="submit" colorScheme='blue' mr={3} variant='solid'>Módosítás</Button>
                                <Button onClick={onCloseBoardEditPos}>
                                    Visszavonás
                                </Button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </Modal >
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
                            <Input variant={"filled"} onChange={debouncedChangeHandler} type='text' placeholder='Feladat keresése...' />
                        </InputGroup>
                        <AvatarGroup userSelect={'none'} size={"md"}>
                            {selectedPeople && selectedPeople.map((i, k) => {
                                return <Avatar borderWidth={3} borderColor={i.selected ? "blue" : ""} onClick={() => handleFilterPeople(i.id)} _hover={{ opacity: 0.8, cursor: "pointer" }} name={i.label} key={k} />
                            })}
                        </AvatarGroup>
                        <ChakraSelect placeholder="Szűrés prioritás szerint..." onChange={(e) => handlePriorityFilter(e)} isClearable={true} variant='filled' options={priorities} name='priorities' components={customComponents}>
                        </ChakraSelect>
                    </HStack>
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        <HStack userSelect={"none"} gap={5} >
                            {boards && boards.map((i, k) => {
                                return <Stack
                                    key={k}
                                    minH="90vh"
                                    width="250px"
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
                                                <MenuItem onClick={() => handleBoardDeleteOpen(i.id)} icon={<FaTrash />}>
                                                    Board törlése
                                                </MenuItem>
                                                <MenuItem onClick={() => handleBoardEditOpen(i.title, i.id)} icon={<FaPen />}>
                                                    Board átnevezése
                                                </MenuItem>
                                                <MenuItem onClick={() => handleBoardEditPosOpen(i.id)} icon={<MdNumbers />}>
                                                    Board áthelyezése
                                                </MenuItem>
                                            </MenuList>
                                        </Menu>
                                    </HStack>
                                    <Flex as={Button} gap={2} onClick={() => handleAddIssueOpen(i.id)} _hover={{ bg: (colorMode === 'light' ? "gray.100" : "gray.500"), cursor: 'pointer' }} bg={colorMode === 'light' ? "white" : '#333'} align="center" borderRadius={5} p={1} justify={"center"}>
                                        <FaPlus />
                                        <Text>Ügy hozzáadása</Text>
                                    </Flex>
                                    <Droppable droppableId={`${i.id}`} direction='vertical'>
                                        {(provided, snapshot) => (
                                            <Flex h="100%" {...provided.droppableProps}
                                                ref={provided.innerRef} gap={5} direction={"column"} bg={colorMode === 'light' ? (snapshot.isDraggingOver ? "gray.100" : "gray.200") : (snapshot.isDraggingOver ? "#333" : "#444")}>
                                                {
                                                    i.issues.filter(i => (priority === null || i.priority.id == priority)).filter(i => i.title.toLowerCase().includes(search))
                                                        .filter(elem => {
                                                            if (selectedPeople.filter(item => item.selected === true).length === 0) {
                                                                return true
                                                            }
                                                            return elem.assignedPeople.some(person => {
                                                                const rr = selectedPeople.find(item => item.id === person.userId);
                                                                console.log(person)
                                                                return rr && rr.selected === true;
                                                            })
                                                        })
                                                        .map((issue, key) => {
                                                            return <Issue key={key} index={key} issue={issue} handleOpenIssue={handleOpenIssue} handlePriorityIcon={handlePriorityIcon} boardId={i.id} />
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
