import {
    Avatar,
    AvatarGroup,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Button,
    Checkbox,
    Divider,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
    HStack,
    Heading,
    Icon,
    IconButton,
    Input,
    InputGroup, InputRightElement,
    Menu, MenuButton,
    MenuItem,
    MenuList,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    NumberInput,
    NumberInputField,
    Select,
    Spacer,
    Spinner,
    Stack,
    Tag, TagLabel,
    Text,
    Textarea,
    Tooltip,
    useColorMode,
    useDisclosure, useToast
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { Select as ChakraSelect, GroupBase, SelectComponentsConfig, chakraComponents } from "chakra-react-select"
import debounce from "lodash/debounce"
import moment from "moment"
import 'moment/dist/locale/hu'
import { ChangeEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { DragDropContext, DropResult, Droppable } from "react-beautiful-dnd"
import { Controller, useForm } from 'react-hook-form'
import { AiFillBug, AiFillCheckSquare } from "react-icons/ai"
import { BsBarChartFill, BsChatLeftTextFill, BsFillBookmarkFill, BsFillCalendarDateFill, BsThreeDots } from "react-icons/bs"
import { FaClock, FaPen, FaPlus, FaSearch, FaTrash, FaUser, FaUsers } from 'react-icons/fa'
import { FcHighPriority, FcLowPriority, FcMediumPriority } from "react-icons/fc"
import { ImCross } from "react-icons/im"
import { MdInfo, MdNumbers } from "react-icons/md"
import { Link, useNavigate, useParams } from 'react-router-dom'
import { addChildIssue, addIssueToBoard, changeIssue, changeIssuePosition1, changeIssuePosition2, deleteChildIssue, deleteIssueFromBoard } from '../api/issue'
import { getProjectById } from '../api/project'
import { addProjectBoard, deleteProjectBoard, editProjectBoard, editProjectBoardPosition, getProjectBoards } from '../api/projectBoard'
import InputComponent from '../components/InputComponent'
import Issue from '../components/IssueComponent'
import { useAuth } from '../contexts/AuthContext'
import { IssueRequestView, IssueResponse, ParticipantResponse, ProjectListRequest, ProjectListResponse } from '../interfaces/interfaces'
import EditorComponent from '../components/EditorComponent'
import { addCommentToIssue, deleteCommentFromIssue } from '../api/user'
import { TbSubtask } from "react-icons/tb"

interface PriorityL {
    value: string,
    label: string,
    icon?: ReactNode
}

const customComponents: SelectComponentsConfig<
    PriorityL,
    false,
    GroupBase<PriorityL>
> = {
    Option: ({ children, ...props }) => (
        <chakraComponents.Option {...props}>
            {props.data.icon} {props.data.label}
        </chakraComponents.Option>
    ),
};

export default function ProjectListPage() {
    // AUTH
    const { user } = useAuth()

    const toast = useToast()

    // REACT ROUTER
    const { projectId } = useParams()

    const { data: project, isLoading: isLoadingProject, isError: projectIsError } = useQuery({
        queryKey: ['getProject'],
        queryFn: () => getProjectById(params.projectId!).then(res => res.data),
        retry: 1
    })

    const { data: boards, isLoading: isLoadingBoards, isError: projectListIsError, refetch: refetchProjectLists } = useQuery({
        queryKey: ['getProjectLists'],
        queryFn: () => getProjectBoards(params.projectId!).then(res => res.data),
        retry: 1
    })

    const params = useParams<{ projectId?: string }>()

    // STATES
    const [currentIssue, setCurrentIssue] = useState<IssueResponse>()
    const [currentBoardId, setCurrentBoardId] = useState<string>()
    const [assignedPeople, setAssignedPeople] = useState<Array<{ id: number, label: string, value: string }>>([])

    const [viewOld, setViewOld] = useState<boolean>(true)

    const [people, setPeople] = useState<Array<{ id: number, label: string, value: string }>>([])
    const [search, setSearch] = useState<string>("");
    const [title, setTitle] = useState<string>("")
    const [priority, setPriority] = useState(null) // filter off when state null
    const [selectedPeople, setSelectedPeople] = useState<Array<{ id: string, label: string, selected: boolean }>>([])
    const [comment, setComment] = useState<string>("")
    const [otherBoards, setOtherBoards] = useState<Array<ProjectListResponse>>([])

    const [slide, setSlide] = useState<number>(0)
    const [commenting, setCommenting] = useState<number>(0)
    const formRef = useRef<HTMLFormElement>(null)
    const initRef = useRef(null)

    const navigate = useNavigate()

    useEffect(() => {
        if (project) {
            const arr: Array<{ id: number, label: string, value: string }> = []
            const arr2: Array<{ id: string, label: string, selected: boolean }> = []
            project.participants.forEach(item => {
                arr.push({ id: item.id, label: `${item.lastName} ${item.firstName}`, value: `${item.userId}` })
                arr2.push({ id: item.userId, label: `${item.lastName} ${item.firstName}`, selected: false })
            })
            setPeople(arr)
            setSelectedPeople(arr2)
        }
    }, [project, boards])

    // CHAKRA
    const { colorMode } = useColorMode()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: isOpenAddIssue, onOpen: onOpenAddIssue, onClose: onCloseAddIssue } = useDisclosure()
    const { isOpen: isOpenIssue, onOpen: onOpenIssue, onClose: onCloseIssue } = useDisclosure()
    const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure()
    const { isOpen: isOpenBoardEdit, onOpen: onOpenBoardEdit, onClose: onCloseBoardEdit } = useDisclosure()
    const { isOpen: isOpenBoardDelete, onOpen: onOpenBoardDelete, onClose: onCloseBoardDelete } = useDisclosure()
    const { isOpen: isOpenBoardEditPos, onOpen: onOpenBoardEditPos, onClose: onCloseBoardEditPos } = useDisclosure()
    const { isOpen: isOpenAddSubtask, onOpen: onOpenAddSubtask, onClose: onCloseAddSubtask } = useDisclosure()
    const { isOpen: isOpenDeleteSubtask, onOpen: onOpenDeleteSubtask, onClose: onCloseDeleteSubtask } = useDisclosure()

    // REACT HOOK FORM
    const { register: registerBoardCreate, handleSubmit: handleSubmitBoardCreate, reset: resetBoardCreate, formState: { errors: errorsBoardCreate, isSubmitting: isSubmittingBoardCreate } } = useForm<ProjectListRequest>();

    const { register: registerIssueCreate, handleSubmit: handleSubmitIssueCreate, reset: resetIssueCreate, formState: { errors: errorsIssueCreate, isSubmitting: isSubmittingIssueCreate }, control: controlIssueCreate } = useForm<IssueRequestView>({ defaultValues: { description: "" } });

    const { register: registerBoardEdit, handleSubmit: handleSubmitBoardEdit, reset: resetBoardEdit, formState: { errors: errorsBoardEdit, isSubmitting: isSubmittingBoardEdit } } = useForm<ProjectListRequest>();

    const { register: registerView, handleSubmit: handleSubmitView, reset: resetView, formState: { errors: errorsView, isDirty, dirtyFields }, control: controlView } = useForm<IssueRequestView>({
        shouldUnregister: true
    })
    const { handleSubmit: handleSubmitDelete, formState: { isSubmitting: isSubmittingDelete } } = useForm()

    const { register: registerBoardEditPos, handleSubmit: handleSubmitBoardEditPos, reset: resetBoardEditPos, formState: { isSubmitting: isSubmittingBoardEditPos } } = useForm<{ boardId: string }>();

    const { register: registerAddSubtask, handleSubmit: handleSubmitAddSubtask, reset: resetAddSubtask, formState: { isSubmitting: isSubmittingAddSubtask } } = useForm<{ childId: string }>();

    const handleIssueTypeIcon = (title: string) => {
        if (title === "Task") {
            return <AiFillCheckSquare color='#42a4ff' />
        }
        else if (title === "Bug") {
            return <AiFillBug color='#eb5757' />
        }
        else if (title == "Story") {
            return <BsFillBookmarkFill color='#c5ff3d' />
        }
        else if (title == "Subtask") {
            return <TbSubtask color='#42a4ff' />
        }
    }

    const priorities = [
        { value: "1", label: "Legalacsonyabb", icon: <Icon mr={2} as={FcLowPriority} /> },
        { value: "2", label: "Alacsony", icon: <Icon mr={2} as={FcLowPriority} /> },
        { value: "3", label: "Közepes", icon: <Icon mr={2} as={FcMediumPriority} /> },
        { value: "4", label: "Magas", icon: <Icon mr={2} as={FcHighPriority} /> },
        { value: "5", label: "Legmagasabb", icon: <Icon mr={2} as={FcHighPriority} /> },
    ]

    const issueTypes = [
        { value: "1", label: "Feladat", icon: <Icon mr={2} as={AiFillCheckSquare} color='#42a4ff' /> },
        { value: "2", label: "Story", icon: <Icon mr={2} as={BsFillBookmarkFill} color='#c5ff3d' /> },
        { value: "3", label: "Bug", icon: <Icon mr={2} as={AiFillBug} color='#eb5757' /> },
        { value: "4", label: "Alfeladat", icon: <Icon mr={2} as={TbSubtask} color='#42a4ff' /> }
    ]

    const [childrenIssuesList, setChildrenIssuesList] = useState<Array<IssueResponse>>()
    const [selectedChildrenIssues, setSelectedChildrenIssues] = useState<Array<{ label: string, value: string }>>([])

    const handleOpenChildIssue = (issueObject: IssueResponse) => {
        let boardId = "0"
        boards!.forEach(board => {
            const foundIssue = board.issues.find(issue => issue.id === issueObject.id);
            if (foundIssue) {
                boardId = board.id;
            }
        });
        setCommenting(0)
        resetView()
        setSlide(0)
        setComment("")
        setAssignedPeople([])
        onCloseIssue()

        // Modal delay
        setTimeout(function () {
            handleOpenIssue(issueObject, boardId)
        }, 500);
    }

    // FUNCTIONS
    const handleOpenIssue = (issueObject: IssueResponse, boardId: string) => {
        if (project && boards) {
            setCurrentIssue(issueObject)
            setCurrentBoardId(boardId)
            const arr: Array<{ id: number, label: string, value: string }> = []
            project.participants.map(p => {
                if (issueObject.assignedPeople.some(a => a.userId === p.userId)) {
                    arr.push({ id: p.id, label: `${p.lastName} ${p.firstName}`, value: `${p.userId}` })
                }
            })

            const tmp: Array<IssueResponse> = []
            if (issueObject.childrenIssues) {
                issueObject.childrenIssues.forEach(i => {
                    tmp.push(boards.filter(b => b.id == i.projectListId)[0].issues.filter(is => is.id == i.id)[0])
                })
            }

            setChildrenIssuesList(tmp)
            setSlide(issueObject.timeSpent)
            setAssignedPeople(arr)
            onOpenIssue()
        }
    }

    const handleAddBoard = async (data: ProjectListRequest) => {
        if (project && boards)
            try {
                await addProjectBoard(project.id, { title: data.title, position: boards.length + 1 })
                toast({
                    title: 'Board sikeresen létrehozva a projekthez.',
                    status: 'success',
                    duration: 4000,
                    isClosable: true,
                })
                updateProjectBoards()
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
        if (currentIssue !== null && projectId && currentIssue && currentBoardId)
            try {
                await deleteIssueFromBoard(projectId, currentBoardId, currentIssue.id)
                toast({
                    title: 'Issue sikeresen törölve!.',
                    status: 'success',
                    duration: 4000,
                    isClosable: true,
                })
                updateProjectBoards()
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

    const handleOnDragEnd = async (result: DropResult) => {
        if (boards && projectId) {
            if (!result.destination) {
                return;
            }

            // csere oszlopok között
            if (result.source.droppableId !== result.destination.droppableId) {
                const sourceColumn = boards.find((b) => b.id === result.source.droppableId)
                const destinationColumn = boards.find((b) => b.id === result.destination!.droppableId)

                const sourceIndex = result.source.index
                const destinationIndex = result.destination.index

                if (sourceColumn && destinationColumn) {
                    const movedIssue = sourceColumn.issues[sourceIndex]

                    // Távolítsuk el az elemet a forrás oszlopból
                    sourceColumn.issues.splice(sourceIndex, 1)

                    // Az elemet szúrjuk be a cél oszlopba
                    destinationColumn.issues.splice(destinationIndex, 0, movedIssue)

                    // Frissítsük a pozíciókat mindkét oszlopban
                    for (let i = 0; i < sourceColumn.issues.length; i++) {
                        sourceColumn.issues[i].position = i + 1;
                    }

                    for (let i = 0; i < destinationColumn.issues.length; i++) {
                        destinationColumn.issues[i].position = i + 1;
                    }

                    // A poziciókat id-vel eltárolom Dict-be és elküldöm
                    const sourcePositions: { [id: string]: number } = {};
                    for (let i = 0; i < sourceColumn.issues.length; i++) {
                        sourcePositions[sourceColumn.issues[i].id] = sourceColumn.issues[i].position;
                    }

                    const destPositions: { [id: string]: number } = {};
                    for (let i = 0; i < destinationColumn.issues.length; i++) {
                        destPositions[destinationColumn.issues[i].id] = destinationColumn.issues[i].position;
                    }

                    await changeIssuePosition2(projectId, result.source.droppableId, result.destination.droppableId,
                        movedIssue.id, sourcePositions, destPositions)
                    updateProjectBoards()
                }
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

                const positions: { [id: string]: number } = {};
                for (let i = 0; i < newIssues.length; i++) {
                    positions[newIssues[i].id] = newIssues[i].position;
                }

                // Az új elemekkel frissítjük a 'column' objektumot
                column.issues = newIssues;

                await changeIssuePosition1(projectId, result.source.droppableId, JSON.stringify(positions))
                updateProjectBoards()

            }
        }
    }

    const changeHandler = (event: ChangeEvent) => {
        setSearch((event.target as HTMLInputElement).value);
    };

    const debouncedChangeHandler = useMemo(
        () => debounce(changeHandler, 300)
        , []);

    const commentHandler = (event: ChangeEvent) => {
        setComment((event.target as HTMLInputElement).value)
    }

    const debouncedCommentHandler = useMemo(
        () => debounce(commentHandler, 300)
        , []);


    useEffect(() => {
        return () => {
            debouncedChangeHandler.cancel();
        }
    }, []);

    const handleAddIssueOpen = (boardId: string) => {
        setCurrentBoardId(boardId)
        onOpenAddIssue()
    }

    const handleAddIssueForm = async (object: IssueRequestView) => {
        if (boards && projectId && currentBoardId) {
            const b = boards.filter(i => i.id === currentBoardId)[0].issues
            let maxPos = 0
            b.forEach(i => {
                if (i.position > maxPos)
                    maxPos = i.position
            })
            if (object.assignedPeople) {
                const aPeople = object.assignedPeople.map(a => {
                    return a.id
                })
                await addIssueToBoard(projectId, currentBoardId,
                    { ...object, description: object.description, priorityId: object.priorityId, position: maxPos + 1 }, aPeople, updateProjectBoards)
            }
            else {
                await addIssueToBoard(projectId, currentBoardId,
                    { ...object, description: JSON.stringify(object.description), priorityId: object.priorityId, position: maxPos + 1 }, [], updateProjectBoards)
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
    }

    const handleAddIssueClose = () => {
        resetIssueCreate({
            description: " "
        })
        setAssignedPeople([])
        onCloseAddIssue()
    }

    const updateProjectBoards = () => {
        refetchProjectLists()
    }

    const handlePriorityIcon = (priority: any) => {
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

    const handleBoardEditOpen = (obj: string, obj2: string) => {
        setTitle(obj)
        setCurrentBoardId(obj2)
        onOpenBoardEdit()
    }

    const handleBoardEditPosOpen = (obj: string) => {
        setCurrentBoardId(obj)
        if (boards) {
            const elements = boards.filter(i => i.id !== obj)
            setOtherBoards(elements)
        }
        onOpenBoardEditPos()
    }

    const handleBoardDeleteOpen = (boardId: string) => {
        setCurrentBoardId(boardId)
        onOpenBoardDelete()
    }

    const handleBoardDelete = async () => {
        try {
            await deleteProjectBoard(projectId!, currentBoardId!)
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
        setCurrentBoardId("")
        resetBoardEdit()
        setTitle("")
        onCloseBoardEdit()
    }

    const IsUserProjectOwner = (participants: Array<ParticipantResponse>) => {
        if (participants.filter(i => i.userId === user!.id && i.roleName === "Owner").length !== 0) {
            return true
        }
        return false
    }

    const handleBoardEdit = async (obj: ProjectListRequest) => {
        try {
            await editProjectBoard(projectId!, currentBoardId!, obj)
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

    const handleOnCloseIssue = async (e: IssueRequestView) => {
        if (isDirty) {
            if (Object.keys(dirtyFields).length > 0) {
                const patchData: Array<{ op: string, path: string, value: any }> = [];
                Object.keys(dirtyFields).forEach(key => {
                    if (dirtyFields.hasOwnProperty(key) && dirtyFields[key as keyof IssueRequestView]) {
                        if (key === "description") {
                            patchData.push({
                                op: 'replace',
                                path: `/${key}`,
                                value: e[key]
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
                                tmp.push({ userId: data.value, issueId: currentIssue!.id })
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
                                value: e[key as keyof IssueRequestView]
                            })
                        }
                    }
                })
                await changeIssue(projectId!, currentBoardId!, currentIssue!.id, patchData)
                updateProjectBoards()
                toast({
                    title: 'Feladat leírása sikeresen módosítva.',
                    status: 'success',
                    duration: 4000,
                    isClosable: true,
                })
            }
        }
        setCommenting(0)
        resetView()
        setSlide(0)
        setComment("")
        setAssignedPeople([])
        onCloseIssue()
    }

    const handleFilterPeople = (id: string) => {
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

    const handlePriorityFilter = (e: any) => {
        if (e)
            setPriority(e.value)
        else
            setPriority(null)
    }

    const handleComment = async () => {
        try {
            await addCommentToIssue(projectId!, currentIssue!.id, comment)
            toast({
                title: 'Hozzászólás sikeresen hozzáadva a feladathoz.',
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
            setComment("")
            setCommenting(0)
            updateProjectBoards()

            onCloseIssue()
        } catch (e) {
            toast({
                title: 'Hozzászólás rögzítése sikertelen.',
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
            onCloseIssue()
        }
    }

    const handleDeleteComment = async (id: string) => {
        try {
            await deleteCommentFromIssue(projectId!, currentIssue!.id, id)
            toast({
                title: 'Hozzászólás sikeresen törölve.',
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
        } catch {
            toast({
                title: 'Hozzászólás törlése sikertelen.',
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
        }
        updateProjectBoards()
        onCloseIssue()
    }

    const handleCloseBoardEditPos = () => {
        resetBoardEditPos()
        onCloseBoardEditPos()
    }

    const handleBoardPosition = async (obj: { boardId: string }) => {
        try {
            await editProjectBoardPosition(projectId!, currentBoardId!, obj.boardId)
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

    const handleOpenSubtask = () => {

        const tmp = boards?.flatMap(i => i.issues.filter(j => j.issueType.name === "Subtask" && j.parentIssueId === null))
        const tmp2: Array<{ label: string, value: string, id: string }> = []

        tmp?.forEach(t => {
            tmp2.push({ label: t.title, value: t.id, id: t.id })
        })
        setSelectedChildrenIssues(tmp2)
        onOpenAddSubtask()
    }

    const handleAddSubtask = async (obj: { childId: string }) => {

        try {
            await addChildIssue(projectId!, obj.childId, currentIssue!.id)
            toast({
                title: 'Feladat hozzárendelés sikeres.',
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
        } catch (e) {
            toast({
                title: 'Hiba történt a hozzárendelés során.',
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
        }
        updateProjectBoards()
        resetAddSubtask()
        onCloseAddSubtask()
        onCloseIssue()
    }

    const [currentChildIssue, setCurrentChildIssue] = useState<string>("")

    const handleOpenDeleteSubtask = (issueId: string) => {
        setCurrentChildIssue(issueId)
        onOpenDeleteSubtask()
    }

    const handleDeleteSubtask = async () => {
        try {
            await deleteChildIssue(projectId!, currentChildIssue, currentIssue!.id)
            toast({
                title: 'Feladat leválasztása sikeres.',
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
        } catch (e) {
            toast({
                title: 'Hiba történt a feladat leválasztása során.',
                status: 'error',
                duration: 4000,
                isClosable: true,
            })
        }
        updateProjectBoards()
        onCloseDeleteSubtask()
        onCloseIssue()
    }

    moment.locale('hu')

    if (projectIsError || projectListIsError) {
        navigate('/dashboard')
    }
    if (isLoadingProject || isLoadingBoards) {
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
                                <InputComponent
                                    name="title"
                                    type="text"
                                    register={registerBoardCreate}
                                    required={true}
                                    error={Boolean(errorsBoardCreate.title)}
                                    label='Tábla neve'
                                    errorMessage='Kérem adja meg a tábla címét.'
                                />
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
                <Modal trapFocus={false} size="3xl" isOpen={isOpenAddIssue} onClose={handleAddIssueClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalCloseButton />
                        <ModalHeader>Ügy létrehozása</ModalHeader>
                        <form autoComplete='off' onSubmit={handleSubmitIssueCreate(handleAddIssueForm)}>
                            <ModalBody>
                                <Stack spacing={5}>
                                    <FormControl isInvalid={Boolean(errorsIssueCreate.title)}>
                                        <FormLabel>Cím</FormLabel>
                                        <Input placeholder='Feladat címe' variant={"filled"} type="text" {...registerIssueCreate("title", { required: true })} />
                                        <FormErrorMessage>{errorsIssueCreate.title ? "Kérem írjon be címet." : ""}</FormErrorMessage>
                                    </FormControl>
                                    <FormControl zIndex={1000} isInvalid={Boolean(errorsIssueCreate.issueTypeId)}>
                                        <FormLabel>Feladat típusa</FormLabel>
                                        <Controller name="issueTypeId" rules={{ required: true }} control={controlIssueCreate} render={({ field: { value, onChange } }) => (
                                            <ChakraSelect components={customComponents} placeholder="Feladat típusa" isClearable={true} variant='filled' options={issueTypes} onChange={onChange} value={value} />
                                        )} />
                                        <FormErrorMessage>{errorsIssueCreate.priorityId ? "Kérem válasszon ki feladat típust." : ""}</FormErrorMessage>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Leírás</FormLabel>
                                        <Controller name="description" rules={{ required: false }} control={controlIssueCreate}
                                            render={({ field: { value, onChange } }) => (
                                                <EditorComponent toolbar={true} theme={colorMode === 'dark' ? 'dark' : 'light'} data={value!} setData={onChange} />
                                            )} />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Személyek hozzárendelése</FormLabel>
                                        {project &&
                                            <Controller name="assignedPeople" rules={{ required: false }} control={controlIssueCreate}
                                                render={({ field: { value, onChange } }) => (
                                                    <>
                                                        <ChakraSelect isMulti={true} placeholder="Személyek hozzárendelése" isClearable={true} variant='filled' options={people} onChange={onChange} value={value} />
                                                    </>
                                                )} />

                                        }
                                    </FormControl>
                                    <FormControl isInvalid={Boolean(errorsIssueCreate.priorityId)}>
                                        <FormLabel>Prioritás</FormLabel>
                                        <Controller name="priorityId" rules={{ required: true }} control={controlIssueCreate} render={({ field: { value, onChange } }) => (
                                            <ChakraSelect components={customComponents} placeholder="Szűrés prioritás szerint..." isClearable={true} variant='filled' options={priorities} onChange={onChange} value={value} />
                                        )} />
                                        <FormErrorMessage>{errorsIssueCreate.priorityId ? "Kérem válasszon ki prioritást." : ""}</FormErrorMessage>
                                    </FormControl>
                                    <FormControl isInvalid={Boolean(errorsIssueCreate.timeEstimate)}>
                                        <FormLabel>Becsült idő (óra)</FormLabel>
                                        <Input placeholder='1' variant={"filled"}  {...registerIssueCreate("timeEstimate", { required: false, valueAsNumber: true, validate: (value) => value! >= 1 })} type="number" />
                                        <FormErrorMessage>{errorsIssueCreate.timeEstimate ? "0-tól nagyobb számot adjon meg." : ""}</FormErrorMessage>
                                    </FormControl>
                                    <FormControl isInvalid={Boolean(errorsIssueCreate.dueDate)}>
                                        <FormLabel>Határidő</FormLabel>
                                        <Input variant={"filled"} {...registerIssueCreate("dueDate", { required: false, valueAsDate: true, validate: (value) => value > (new Date()) })} type="date" />
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
                </Modal>
                {/* Issue megtekintése */}
                <Modal trapFocus={false} initialFocusRef={initRef} closeOnOverlayClick={true} size="5xl" isOpen={isOpenIssue} onClose={() => {
                    formRef.current!.requestSubmit()
                }
                }>
                    <ModalOverlay />
                    {
                        currentIssue && formRef ?
                            <ModalContent>
                                <form ref={formRef!} autoComplete='off' onSubmit={handleSubmitView(handleOnCloseIssue)}>
                                    <ModalHeader>
                                        <HStack align={"center"}>
                                            {handleIssueTypeIcon(currentIssue.issueType.name)}
                                            <FormControl isInvalid={Boolean(errorsView.title)} mt={1}>
                                                <Input maxW="80%" border="0" {...registerView("title", { required: true })} defaultValue={currentIssue.title} />
                                                {/* <Editable selectAllOnFocus={false} maxW={"90%"} defaultValue={currentIssue.title}>
                                                    <EditablePreview />
                                                    <EditableInput {...registerView("title", { required: true })} />
                                                </Editable> */}
                                                <FormErrorMessage>{errorsView.title ? "Kérem adjon címet a feladatnak." : ""}</FormErrorMessage>
                                            </FormControl>
                                        </HStack>
                                    </ModalHeader>
                                    <IconButton aria-label='Delete issue' onClick={onOpenDelete} size="md" right={14} top={5} position={"absolute"} variant="ghost" icon={<FaTrash />} />
                                    <IconButton ref={initRef} aria-label='Save issue' type="submit" size="md" right={2} top={5} position={"absolute"} variant="ghost" icon={<ImCross />} />
                                    {currentIssue.issueType.name === 'Subtask' ?
                                        <IconButton aria-label='Navigate to parent issue' type="submit" size="md" right={100} top={5} position={"absolute"} variant="ghost" icon={<ImCross />} />
                                        : ""}
                                    <ModalBody overflowY={"auto"}>
                                        <HStack gap="30px" align={"flex-start"}>
                                            <Flex maxH="100vh" w="60%" direction={"column"}>
                                                <FormControl>
                                                    <FormLabel>Leírás</FormLabel>
                                                    <Controller defaultValue={currentIssue.description} name="description" rules={{ required: false }} control={controlView}
                                                        render={({ field: { value, onChange } }) => (
                                                            <EditorComponent toolbar={true} theme={colorMode === 'dark' ? 'dark' : 'light'} data={value!} setData={onChange} />
                                                        )} />
                                                </FormControl>
                                                {currentIssue.issueType.name !== "Subtask" ?
                                                    <>
                                                        <HStack align={"center"} ml={3}>
                                                            <TbSubtask size={20} />
                                                            <Heading size="md">Hozzárendelt feladatok: </Heading>
                                                            <IconButton onClick={() => handleOpenSubtask()} aria-label='add subtask' variant="solid" size="sm" icon={<FaPlus />} />
                                                        </HStack>
                                                        <Stack ml={3}>
                                                            {childrenIssuesList ? childrenIssuesList.map((i, k) => {
                                                                return <Tag gap={3} key={k} p={2}>
                                                                    {handleIssueTypeIcon(i.issueType.name)}
                                                                    <Tooltip label={`Ugrás a(z) ${i.title} feladatra`}><Text onClick={() => handleOpenChildIssue(i)} _hover={{ textDecor: "underline", cursor: "Pointer" }}>
                                                                        {i.title}
                                                                    </Text></Tooltip>
                                                                    <Spacer />
                                                                    <Avatar name={i.reporterName} size="xs" />
                                                                    {handlePriorityIcon(i.priority)}
                                                                    <Tooltip label="Hozzárendelt feladat leválasztása"><IconButton variant="solid" onClick={() => handleOpenDeleteSubtask(i.id)} icon={<ImCross />} aria-label='remove subtask' size="sm" /></Tooltip>
                                                                </Tag>
                                                            }) : ""}
                                                        </Stack>
                                                    </>
                                                    : ""
                                                }
                                                <FormControl p={3}>
                                                    <FormLabel>
                                                        <HStack>
                                                            <BsChatLeftTextFill size={20} />
                                                            <Heading size="md">Hozzászólások ({currentIssue.comments.length})</Heading>
                                                        </HStack>
                                                    </FormLabel>
                                                    <HStack mb={3} align="baseline">
                                                        <Avatar size="sm" name={`${user?.lastName} ${user?.firstName}`} />
                                                        <Textarea onFocus={() => setCommenting(1)} onChange={debouncedCommentHandler} placeholder='Hozzászólás írása...' />
                                                    </HStack>
                                                    {commenting ? <>
                                                        <Button mb={5} ml={10} onClick={() => handleComment()} colorScheme='blue'>Elküldés</Button>
                                                        <Button mb={5} ml={5} onClick={() => { setCommenting(0) }} colorScheme='gray'>Visszavonás</Button></> : ""}
                                                </FormControl>
                                                {currentIssue.comments.map((c, k) => {
                                                    return <>
                                                        <Stack p={3} key={k} gap={2} >
                                                            <HStack mb={2}>
                                                                <Avatar size="sm" name={c.authorName} />
                                                                <Text fontWeight={"medium"}>{c.authorName} </Text>
                                                                <Text>{moment(c.created).fromNow()}</Text>
                                                            </HStack>
                                                            <HStack pl={"40px"}>
                                                                <Text overflow={"hidden"}>
                                                                    {c.content}
                                                                </Text>
                                                                <Spacer />
                                                                {c.authorName === `${user?.lastName} ${user?.firstName}` ?
                                                                    <IconButton onClick={() => handleDeleteComment(c.id)} aria-label="Delete comment" icon={<FaTrash />} size="sm" /> : ""}
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
                                                        {boards!.map((j, k) => {
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
                                                    </FormLabel>
                                                    <Controller defaultValue={assignedPeople} name="assignedPeople" rules={{ required: false }} control={controlView}
                                                        render={({ field: { value, onChange } }) => (
                                                            <>
                                                                <ChakraSelect useBasicStyles tagVariant='solid' isMulti={true} placeholder="Személyek hozzárendelése" isClearable={true} variant='filled' options={people} onChange={onChange} value={value} />
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
                                                <FormControl isInvalid={Boolean(errorsView.priorityId)} >
                                                    <FormLabel>
                                                        <HStack>
                                                            <BsBarChartFill />
                                                            <Text>Prioritás</Text>
                                                        </HStack>
                                                    </FormLabel>
                                                    <Controller defaultValue={{ value: `${currentIssue.priority.id}`, label: `${currentIssue.priority.name}` }} name="priorityId" rules={{ required: true }} control={controlView}
                                                        render={({ field: { value, onChange } }) => (
                                                            <>
                                                                <ChakraSelect components={customComponents} placeholder={"Prioritás kiválasztása"} isClearable={true} variant='filled' options={priorities} onChange={onChange} value={value} />
                                                            </>
                                                        )} />
                                                    <FormErrorMessage>{errorsView.priorityId ? "Kérem válasszon ki prioritást." : ""}</FormErrorMessage>
                                                </FormControl>
                                                <FormControl isInvalid={Boolean(errorsView.timeEstimate)}>
                                                    <FormLabel>
                                                        <HStack>
                                                            <FaClock />
                                                            <Text>Feladatra becsült idő (órában)</Text>
                                                        </HStack>
                                                    </FormLabel>                                                    <NumberInput step={1} defaultValue={currentIssue.timeEstimate} variant={"filled"}>
                                                        <NumberInputField {...registerView("timeEstimate", { required: false, valueAsNumber: true, validate: (value) => value! >= 1 })} />
                                                    </NumberInput>
                                                    <FormErrorMessage>{errorsView.timeEstimate ? "0-tól nagyobb számot adjon meg." : ""}</FormErrorMessage>
                                                </FormControl>
                                                <FormControl isInvalid={Boolean(errorsView.timeSpent)} zIndex={0}>
                                                    <FormLabel>
                                                        <HStack>
                                                            <FaClock />
                                                            <Text>Befektetett idő (órában)</Text>
                                                        </HStack>
                                                    </FormLabel>
                                                    <Stack >
                                                        <NumberInput step={1} defaultValue={currentIssue.timeSpent} variant={"filled"}>
                                                            <NumberInputField {...registerView("timeSpent", {
                                                                required: false, valueAsNumber: true, validate: (value) => {
                                                                    if (isNaN(value)) {
                                                                        return true
                                                                    } else if (value >= 1) {
                                                                        return true
                                                                    } else {
                                                                        return false
                                                                    }
                                                                }
                                                            })} />
                                                        </NumberInput>
                                                        <FormErrorMessage>{errorsView.timeSpent ? "0-tól nagyobb számot adjon meg." : ""}</FormErrorMessage>
                                                        {/* <Controller defaultValue={currentIssue.timeSpent ? currentIssue.timeSpent : 0} name="timeSpent" rules={{ required: false }} control={controlView}
                                                            render={({ field: { value, onChange } }) => (
                                                                <>
                                                                    <Slider onChangeEnd={(e) => setSlide(e)} onChange={onChange} min={0} max={currentIssue.timeEstimate} aria-label='slider-ex-1' value={value}>
                                                                        <SliderTrack>
                                                                            <SliderFilledTrack />
                                                                        </SliderTrack>
                                                                        <SliderThumb />
                                                                    </Slider>
                                                                </>
                                                            )} /> */}

                                                        <HStack>
                                                            <Text>{slide ? slide : "0"} óra</Text>
                                                            <Spacer />
                                                            <Text>{currentIssue.timeEstimate} órából</Text>
                                                        </HStack>
                                                    </Stack>
                                                </FormControl>
                                                <FormControl isInvalid={Boolean(errorsView.dueDate)}>
                                                    <FormLabel>
                                                        <HStack>
                                                            <BsFillCalendarDateFill />
                                                            <Text>Határidő (dátum)</Text>
                                                        </HStack>
                                                    </FormLabel>
                                                    <Input color={moment(currentIssue.dueDate).isBefore(Date.now()) ? "#e88374" : "green"} variant={"filled"} defaultValue={moment(currentIssue.dueDate).format("yyyy-MM-DD")} {...registerView("dueDate", { required: true, valueAsDate: true })} type="date" />
                                                    <FormErrorMessage>{errorsView.dueDate ? "Adjon meg egy határidőt." : ""}</FormErrorMessage>
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
                                <FormControl isInvalid={Boolean(errorsBoardEdit.title)}>
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
                {/* Subtask hozzáadása */}
                <Modal isOpen={isOpenAddSubtask} onClose={onCloseAddSubtask}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>
                            <Text>Feladat hozzárendelése</Text>
                        </ModalHeader>
                        <ModalCloseButton />
                        <form onSubmit={handleSubmitAddSubtask(handleAddSubtask)}>
                            <ModalBody>
                                <Select {...registerAddSubtask("childId", { required: true })}>
                                    {selectedChildrenIssues.map((i, k) => {
                                        return <option value={i.value} key={k}>{i.label}</option>
                                    })}
                                </Select>
                            </ModalBody>
                            <ModalFooter>
                                <Button isLoading={isSubmittingAddSubtask} type="submit" colorScheme='blue' mr={3} variant='solid'>Hozzárendelés</Button>
                                <Button onClick={onCloseAddSubtask}>
                                    Visszavonás
                                </Button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </Modal>
                {/* Subtask leválasztása */}
                <Modal isOpen={isOpenDeleteSubtask} onClose={onCloseDeleteSubtask}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>
                            <Text>Feladat leválasztásának a megerősítése</Text>
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Text>Biztosan szeretné leválasztani a feladatot?</Text>
                        </ModalBody>
                        <ModalFooter>
                            <Button isLoading={isSubmittingAddSubtask} onClick={handleDeleteSubtask} type="submit" colorScheme='blue' mr={3} variant='solid'>Leválasztás</Button>
                            <Button onClick={onCloseDeleteSubtask}>
                                Visszavonás
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
                <Flex justify={"stretch"} gap={"20px"} flexDirection={"column"} mt={5}>
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <BreadcrumbLink as={Link} to='/dashboard'>Áttekintő</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem isCurrentPage>
                            <BreadcrumbLink href='#'>{project!.title} (Kanban tábla)</BreadcrumbLink>
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
                        <ChakraSelect components={customComponents} placeholder="Szűrés prioritás szerint..." onChange={(e) => handlePriorityFilter(e)} isClearable={true} variant='filled' options={priorities} name='priorities' />
                        <Checkbox isChecked={viewOld} onChange={() => setViewOld(!viewOld)}>Lejárt feladatok mutatása</Checkbox>
                    </HStack>
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        <HStack minH="90vh" userSelect={"none"} gap={5} >
                            {boards && boards.map((i, k) => {
                                return <Stack
                                    key={k}
                                    h="full"
                                    minH="90vh"
                                    width="250px"
                                    bg={colorMode === 'light' ? "gray.200" : "#444"}
                                    p={2}
                                    boxShadow={"lg"}
                                    gap={5}
                                >
                                    <HStack>
                                        <Tooltip label={i.title}>
                                            <Text noOfLines={1} textTransform={"uppercase"}>{i.title}</Text>
                                        </Tooltip>
                                        <Text>{i.issues.length}</Text>
                                        <Spacer />
                                        <Menu>
                                            <MenuButton
                                                isDisabled={IsUserProjectOwner(project!.participants) ? false : true}
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
                                                                return rr && rr.selected === true;
                                                            })
                                                        })
                                                        .filter(i => !viewOld ? (moment(i.dueDate).isAfter(new Date())) : i)
                                                        .map((issue, key) => {
                                                            return <Issue key={key} index={key} issue={issue} handleOpenIssue={handleOpenIssue} handlePriorityIcon={handlePriorityIcon} handleIssueTypeIcon={handleIssueTypeIcon} boardId={i.id} />
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
                                    height="full"
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
