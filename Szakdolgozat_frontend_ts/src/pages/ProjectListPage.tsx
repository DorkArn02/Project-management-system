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
import { FaClock, FaExternalLinkAlt, FaPen, FaPlus, FaSearch, FaTrash, FaUser, FaUsers } from 'react-icons/fa'
import { FcHighPriority, FcLowPriority, FcMediumPriority } from "react-icons/fc"
import { ImCross } from "react-icons/im"
import { MdInfo, MdNumbers } from "react-icons/md"
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
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
import { useTranslation } from 'react-i18next'

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

    const [commenting, setCommenting] = useState<number>(0)
    const formRef = useRef<HTMLFormElement>(null)
    const initRef = useRef(null)

    const navigate = useNavigate()
    const { state } = useLocation();

    useEffect(() => {
        if (state && boards) {
            let obj = boards?.filter(i => i.id == state.boardId)

            if (obj.length != 0) {
                let issueObject = boards?.filter(i => i.id == state.boardId)[0].issues
                    .filter(i => i.id == state.id)[0]

                handleOpenIssue(issueObject!, state.boardId)
            }
        }
    }, [state, boards])


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

    const { register: registerIssueCreate, handleSubmit: handleSubmitIssueCreate, reset: resetIssueCreate, formState: { errors: errorsIssueCreate, isSubmitting: isSubmittingIssueCreate }, control: controlIssueCreate, setFocus: setFocusIssueCreate } = useForm<IssueRequestView>({ defaultValues: { description: "" } });

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


    const { t, ready } = useTranslation()

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
        setComment("")
        setAssignedPeople([])
        onCloseIssue()

        // Modal delay
        setTimeout(function () {
            handleOpenIssue(issueObject, boardId)
        }, 650);
    }

    const handleOpenParentIssue = (issueObject: IssueResponse) => {
        let boardId = "0"
        let targetIssue: IssueResponse
        boards!.forEach(board => {
            const foundIssue = board.issues.find(issue => issue.id === issueObject.parentIssueId);
            if (foundIssue) {
                targetIssue = foundIssue
                boardId = board.id;
            }
        });
        setCommenting(0)
        resetView()
        setComment("")
        setAssignedPeople([])
        onCloseIssue()

        // Modal delay
        setTimeout(function () {
            handleOpenIssue(targetIssue, boardId)
        }, 650);
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
                    tmp.push(boards.filter(b => b.id == i.projectListId!)[0].issues.filter(is => is.id == i.id)[0])
                })
            }

            setChildrenIssuesList(tmp)
            setAssignedPeople(arr)
            onOpenIssue()
        }
    }

    const handleAddBoard = async (data: ProjectListRequest) => {

        if (project && boards)
            try {
                await addProjectBoard(project.id, { title: data.title, position: boards.length })
                toast({
                    title: t('projectlist.popup_board_add_success'),
                    status: 'success',
                    duration: 4000,
                    isClosable: true,
                })
                updateProjectBoards()
                handleCloseAddBoard()
            } catch (e) {
                toast({
                    title: t('projectlist.popup_board_add_error'),
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
                    title: t('projectlist.popup_issue_delete_success'),
                    status: 'success',
                    duration: 4000,
                    isClosable: true,
                })
                updateProjectBoards()
                onCloseDelete()
                onCloseIssue()
            } catch (e) {
                toast({
                    title: t('projectlist.popup_issue_delete_error'),
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
            // csere oszlopon belül
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
        setFocusIssueCreate('title')
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
                title: t('projectlist.popup_issue_add_success'),
                description: "",
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
            updateProjectBoards()
            handleAddIssueClose()
        }
    }

    const handleAddIssueClose = () => {
        resetIssueCreate({
            description: " ",
            assignedPeople: [],
            issueTypeId: undefined,
            dueDate: undefined,
            position: undefined,
            priorityId: undefined,
            projectListId: undefined,
            timeEstimate: undefined,
            timeSpent: undefined,
            title: ""
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
                title: t('projectlist.popup_board_delete_success'),
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
            updateProjectBoards()
            onCloseBoardDelete()
        } catch (e) {
            toast({
                title: t('projectlist.popup_board_delete_error'),
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
                title: t('projectlist.popup_board_edit_title_success'),
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
            updateProjectBoards()
            handleBoardEditClose()
        } catch (e) {
            toast({
                title: t('projectlist.popup_board_edit_title_error'),
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
                    title: t('projectlist.popup_issue_edit_success'),
                    status: 'success',
                    duration: 4000,
                    isClosable: true,
                })
            }
        }
        setCommenting(0)
        resetView()
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
                title: t('projectlist.popup_comment_add_success'),
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
                title: t('projectlist.popup_comment_add_error'),
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
                title: t('projectlist.popup_comment_delete_success'),
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
        } catch {
            toast({
                title: t('projectlist.popup_comment_delete_error'),
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
                title: t('projectlist.popup_board_edit_pos_success'),
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
            updateProjectBoards()
            handleCloseBoardEditPos()
        } catch (e) {
            toast({
                title: t('projectlist.popup_board_edit_pos_error'),
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
                title: t('projectlist.popup_issue_add_subtasks_success'),
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
        } catch (e) {
            toast({
                title: t('projectlist.popup_issue_add_subtasks_error'),
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
                title: t('projectlist.popup_issue_delete_subtasks_success'),
                status: 'success',
                duration: 4000,
                isClosable: true,
            })
        } catch (e) {
            toast({
                title: t('projectlist.popup_issue_delete_subtasks_error'),
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
    if (isLoadingProject && ready || isLoadingBoards && ready) {
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
                        <ModalHeader>{t('projectlist.modal_add_board')}</ModalHeader>
                        <ModalCloseButton />
                        <form autoComplete='off' onSubmit={handleSubmitBoardCreate(handleAddBoard)}>
                            <ModalBody>
                                <InputComponent
                                    name="title"
                                    type="text"
                                    register={registerBoardCreate}
                                    required={true}
                                    error={Boolean(errorsBoardCreate.title)}
                                    label={t('projectlist.label_board_name')}
                                    errorMessage={t('projectlist.label_board_name_error')}
                                    tabIndex={1}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button tabIndex={2} isLoading={isSubmittingBoardCreate} type="submit" colorScheme='blue' mr={3} variant='solid'>{t('dashboard.btn_create')}</Button>
                                <Button tabIndex={3} onClick={handleCloseAddBoard}>
                                    {t('dashboard.btn_cancel')}
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
                        <ModalHeader>{t('projectlist.modal_create_issue')}</ModalHeader>
                        <form autoComplete='off' onSubmit={handleSubmitIssueCreate(handleAddIssueForm)}>
                            <ModalBody>
                                <Stack spacing={5}>
                                    <FormControl isInvalid={Boolean(errorsIssueCreate.title)}>
                                        <FormLabel>{t('projectlist.label_issue_title')}</FormLabel>
                                        <Input tabIndex={1} placeholder={t('projectlist.label_issue_title_more')} variant={"filled"} type="text" {...registerIssueCreate("title", { required: true })} />
                                        <FormErrorMessage>{errorsIssueCreate.title ? t('projectlist.label_issue_title_error') : ""}</FormErrorMessage>
                                    </FormControl>
                                    <FormControl zIndex={1000} isInvalid={Boolean(errorsIssueCreate.issueTypeId)}>
                                        <FormLabel>{t('projectlist.label_issue_type')}</FormLabel>
                                        <Controller name="issueTypeId" rules={{ required: true }} control={controlIssueCreate} render={({ field: { value, onChange } }) => (
                                            <ChakraSelect tabIndex={2} components={customComponents} placeholder={t('projectlist.label_issue_type_more')} isClearable={true} variant='filled' options={issueTypes} onChange={onChange} value={value} />
                                        )} />
                                        <FormErrorMessage>{errorsIssueCreate.priorityId ? t('projectlist.label_issue_type_error') : ""}</FormErrorMessage>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>{t('projectlist.label_issue_description')}</FormLabel>
                                        <Controller name="description" rules={{ required: false }} control={controlIssueCreate}
                                            render={({ field: { value, onChange } }) => (
                                                <EditorComponent tabIndex={3} toolbar={true} theme={colorMode === 'dark' ? 'dark' : 'light'} data={value!} setData={onChange} />
                                            )} />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>{t('projectlist.label_issue_people')}</FormLabel>
                                        {project &&
                                            <Controller name="assignedPeople" rules={{ required: false }} control={controlIssueCreate}
                                                render={({ field: { value, onChange } }) => (
                                                    <>
                                                        <ChakraSelect tabIndex={4} isMulti={true} placeholder={t('projectlist.label_issue_people_more')} isClearable={true} variant='filled' options={people} onChange={onChange} value={value} />
                                                    </>
                                                )} />

                                        }
                                    </FormControl>
                                    <FormControl isInvalid={Boolean(errorsIssueCreate.priorityId)}>
                                        <FormLabel>{t('projectlist.label_issue_priority')}</FormLabel>
                                        <Controller name="priorityId" rules={{ required: true }} control={controlIssueCreate} render={({ field: { value, onChange } }) => (
                                            <ChakraSelect tabIndex={5} components={customComponents} placeholder={t('projectlist.label_issue_priority_more')} isClearable={true} variant='filled' options={priorities} onChange={onChange} value={value} />
                                        )} />
                                        <FormErrorMessage>{errorsIssueCreate.priorityId ? t('projectlist.label_issue_priority_error') : ""}</FormErrorMessage>
                                    </FormControl>
                                    <FormControl isInvalid={Boolean(errorsIssueCreate.timeEstimate)}>
                                        <FormLabel>{t('projectlist.label_issue_time_estimate')}</FormLabel>
                                        <Input tabIndex={6} placeholder='1' variant={"filled"}  {...registerIssueCreate("timeEstimate", { required: false, valueAsNumber: true, validate: (value) => value! >= 1 })} type="number" />
                                        <FormErrorMessage>{errorsIssueCreate.timeEstimate ? t('projectlist.label_issue_time_estimate_error') : ""}</FormErrorMessage>
                                    </FormControl>
                                    <FormControl isInvalid={Boolean(errorsIssueCreate.dueDate)}>
                                        <FormLabel>{t('projectlist.label_issue_deadline')}</FormLabel>
                                        <Input tabIndex={7} variant={"filled"} {...registerIssueCreate("dueDate", { required: false, valueAsDate: true, validate: (value) => value > (new Date()) })} type="date" />
                                        <FormErrorMessage>{errorsIssueCreate.timeEstimate ? t('projectlist.label_issue_deadline_error') : ""}</FormErrorMessage>
                                    </FormControl>
                                </Stack>
                            </ModalBody>
                            <ModalFooter>
                                <Button tabIndex={8} isLoading={isSubmittingIssueCreate} mr={3} type="submit" colorScheme='blue'>{t('dashboard.btn_create')}</Button>
                                <Button tabIndex={9} onClick={handleAddIssueClose}>{t('dashboard.btn_cancel')}</Button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </Modal >
                {/* Issue törlése */}
                <Modal isOpen={isOpenDelete} onClose={onCloseDelete} >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>
                            <Text>{t('projectlist.modal_delete_issue')}</Text>
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Text>{t('projectlist.modal_delete_issue_more')}</Text>
                        </ModalBody>
                        <ModalFooter>
                            <form onSubmit={handleSubmitDelete(handleDeleteIssue)}>
                                <Button type="submit" isLoading={isSubmittingDelete} colorScheme='blue' mr={2}>{t('dashboard.btn_delete')}</Button>
                                <Button onClick={onCloseDelete}>{t('dashboard.btn_cancel')}</Button>
                            </form>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
                {/* Issue megtekintése initialFocusRef={initRef} */}
                <Modal closeOnOverlayClick={true} size="5xl" autoFocus={false} isOpen={isOpenIssue} onClose={() => {
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
                                            <Tooltip label={currentIssue.issueType.name} shouldWrapChildren={true}>{handleIssueTypeIcon(currentIssue.issueType.name)}</Tooltip>
                                            <FormControl isInvalid={Boolean(errorsView.title)} mt={1}>
                                                <Input tabIndex={1} maxLength={50} maxW="80%" border="0" {...registerView("title", { required: true })} defaultValue={currentIssue.title} />
                                                <FormErrorMessage>{errorsView.title ? t('projectlist.label_issue_title_error') : ""}</FormErrorMessage>
                                            </FormControl>
                                        </HStack>
                                    </ModalHeader>
                                    <Tooltip label={t('projectlist.tooltip_delete_task')}>
                                        <IconButton aria-label='Delete issue' onClick={onOpenDelete} size="md" right={14} top={5} position={"absolute"} variant="ghost" icon={<FaTrash />} />
                                    </Tooltip>

                                    <Tooltip label={t('projectlist.tooltip_close_task')}>
                                        <IconButton ref={initRef} aria-label='Save issue' type="submit" size="md" right={2} top={5} position={"absolute"} variant="ghost" icon={<ImCross />} />
                                    </Tooltip>
                                    {currentIssue.issueType.name === 'Subtask' && currentIssue.parentIssueId != null ?
                                        <Tooltip label={t('projectlist.tooltip_navigate_parent_task')}>
                                            <IconButton aria-label='Navigate to parent issue' onClick={() => handleOpenParentIssue(currentIssue)} size="md" right={100} top={5} position={"absolute"} variant="ghost" icon={<FaExternalLinkAlt />} />
                                        </Tooltip>
                                        : ""}
                                    <ModalBody overflowY={"auto"}>
                                        <HStack gap="30px" align={"flex-start"}>
                                            <Flex maxH="100vh" w="60%" direction={"column"}>
                                                <FormControl>
                                                    <FormLabel>{t('projectlist.label_issue_description')}</FormLabel>
                                                    <Controller defaultValue={currentIssue.description} name="description" rules={{ required: false }} control={controlView}
                                                        render={({ field: { value, onChange } }) => (
                                                            <EditorComponent tabIndex={2} toolbar={true} theme={colorMode === 'dark' ? 'dark' : 'light'} data={value!} setData={onChange} />
                                                        )} />
                                                </FormControl>
                                                {currentIssue.issueType.name !== "Subtask" ?
                                                    <>
                                                        <HStack align={"center"} ml={3}>
                                                            <TbSubtask size={20} />
                                                            <Heading size="md">{t('projectlist.label_issue_subtasks')} </Heading>
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
                                                                    <Tooltip label={t('projectlist.label_issue_remove_subtask')}><IconButton variant="solid" onClick={() => handleOpenDeleteSubtask(i.id)} icon={<ImCross />} aria-label='remove subtask' size="sm" /></Tooltip>
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
                                                            <Heading size="md">{t('projectlist.label_issue_comments')} ({currentIssue.comments.length})</Heading>
                                                        </HStack>
                                                    </FormLabel>
                                                    <HStack mb={3} align="baseline">
                                                        <Avatar size="sm" name={`${user?.lastName} ${user?.firstName}`} />
                                                        <Textarea onFocus={() => setCommenting(1)} onChange={debouncedCommentHandler} placeholder={t('projectlist.label_issue_comments_more')} />
                                                    </HStack>
                                                    {commenting ? <>
                                                        <Button mb={5} ml={10} onClick={() => handleComment()} colorScheme='blue'>{t('projectlist.label_issue_comments_send')}</Button>
                                                        <Button mb={5} ml={5} onClick={() => { setCommenting(0) }} colorScheme='gray'>{t('dashboard.btn_cancel')}</Button></> : ""}
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
                                                            <Text>{t('projectlist.label_issue_state')}</Text>
                                                        </HStack>
                                                    </FormLabel>
                                                    <Select tabIndex={3} {...registerView("projectListId", { required: true })} variant={"filled"} size={"md"} defaultValue={currentBoardId}>
                                                        {boards!.map((j, k) => {
                                                            return <option key={k} value={j.id}>{j.title}</option>
                                                        })}
                                                    </Select>
                                                </FormControl>
                                                <FormControl >
                                                    <FormLabel>
                                                        <HStack>
                                                            <FaUsers />
                                                            <Text>{t('projectlist.label_issue_assigned_people')}</Text>
                                                        </HStack>
                                                    </FormLabel>
                                                    <Controller defaultValue={assignedPeople} name="assignedPeople" rules={{ required: false }} control={controlView}
                                                        render={({ field: { value, onChange } }) => (
                                                            <>
                                                                <ChakraSelect
                                                                    tabIndex={4}
                                                                    useBasicStyles tagVariant='solid' isMulti={true} placeholder={t('projectlist.label_issue_people_more')} isClearable={true} variant='filled' options={people} onChange={onChange} value={value} />
                                                            </>
                                                        )} />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel>
                                                        <HStack>
                                                            <FaUser />
                                                            <Text>{t('projectlist.label_issue_reporter')}</Text>
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
                                                            <Text>{t('projectlist.label_issue_priority')}</Text>
                                                        </HStack>
                                                    </FormLabel>
                                                    <Controller defaultValue={{ value: `${currentIssue.priority.id}`, label: `${currentIssue.priority.name}` }} name="priorityId" rules={{ required: true }} control={controlView}
                                                        render={({ field: { value, onChange } }) => (
                                                            <>
                                                                <ChakraSelect tabIndex={5} components={customComponents} placeholder={t('projectlist.label_issue_priority_more')} isClearable={true} variant='filled' options={priorities} onChange={onChange} value={value} />
                                                            </>
                                                        )} />
                                                    <FormErrorMessage>{errorsView.priorityId ? t('projectlist.label_issue_priority_error') : ""}</FormErrorMessage>
                                                </FormControl>
                                                <FormControl isInvalid={Boolean(errorsView.timeEstimate)}>
                                                    <FormLabel>
                                                        <HStack>
                                                            <FaClock />
                                                            <Text>{t('projectlist.label_issue_time_estimate')}</Text>
                                                        </HStack>
                                                    </FormLabel>                              <NumberInput step={1} defaultValue={currentIssue.timeEstimate} variant={"filled"}>
                                                        <NumberInputField tabIndex={6}{...registerView("timeEstimate", { required: false, valueAsNumber: true, validate: (value) => value! >= 1 })} />
                                                    </NumberInput>
                                                    <FormErrorMessage>{errorsView.timeEstimate ? t('projectlist.label_issue_time_estimate_error') : ""}</FormErrorMessage>
                                                </FormControl>
                                                <FormControl isInvalid={Boolean(errorsView.timeSpent)} zIndex={0}>
                                                    <FormLabel>
                                                        <HStack>
                                                            <FaClock />
                                                            <Text>{t('projectlist.label_issue_time_spent')}</Text>
                                                        </HStack>
                                                    </FormLabel>
                                                    <Stack >
                                                        <NumberInput step={1} defaultValue={currentIssue.timeSpent} variant={"filled"}>
                                                            <NumberInputField tabIndex={7} {...registerView("timeSpent", {
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
                                                        <FormErrorMessage>{errorsView.timeSpent ? t('projectlist.label_issue_time_estimate_error') : ""}</FormErrorMessage>
                                                    </Stack>
                                                </FormControl>
                                                <FormControl isInvalid={Boolean(errorsView.dueDate)}>
                                                    <FormLabel>
                                                        <HStack>
                                                            <BsFillCalendarDateFill />
                                                            <Text>{t('projectlist.label_issue_deadline')}</Text>
                                                        </HStack>
                                                    </FormLabel>
                                                    <Input tabIndex={8} color={moment(currentIssue.dueDate).isBefore(Date.now()) ? "#e88374" : "green"} variant={"filled"} defaultValue={moment(currentIssue.dueDate).format("yyyy-MM-DD")} {...registerView("dueDate", { required: true, valueAsDate: true })} type="date" />
                                                    <FormErrorMessage>{errorsView.dueDate ? "Adjon meg egy határidőt." : ""}</FormErrorMessage>
                                                </FormControl>
                                                <Divider />
                                                <Text>{t('projectlist.label_issue_created')}: {moment(currentIssue.created).fromNow()}</Text>
                                                <Text>{t('projectlist.label_issue_updated')}: {moment(currentIssue.updated).fromNow()}</Text>
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
                            <Text>{t('projectlist.modal_edit_name')}</Text>
                        </ModalHeader>
                        <ModalCloseButton />
                        <form autoComplete='off' onSubmit={handleSubmitBoardEdit(handleBoardEdit)}>
                            <ModalBody>
                                <FormControl isInvalid={Boolean(errorsBoardEdit.title)}>
                                    <FormLabel>{t('projectlist.label_board_name')}</FormLabel>
                                    <Input tabIndex={1} defaultValue={title} {...registerBoardEdit("title", { required: true })} type="text" />
                                    {errorsBoardEdit.title ? <FormErrorMessage>{t('projectlist.label_board_name_error')}</FormErrorMessage> : ""}
                                </FormControl>
                            </ModalBody>
                            <ModalFooter>
                                <Button tabIndex={2} isLoading={isSubmittingBoardEdit} type="submit" colorScheme='blue' mr={3} variant='solid'>{t('projectlist.btn_edit')}</Button>
                                <Button tabIndex={3} onClick={handleBoardEditClose}>
                                    {t('dashboard.btn_cancel')}
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
                            <Text>{t('projectlist.modal_delete_board')}</Text>
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            {t('projectlist.modal_delete_board_more')}
                        </ModalBody>
                        <ModalFooter>
                            <form onSubmit={handleSubmitDelete(handleBoardDelete)}>
                                <Button mr={3} onClick={onCloseBoardDelete}>
                                    {t('dashboard.btn_cancel')}
                                </Button>
                                <Button colorScheme='blue' type="submit" isLoading={isSubmittingDelete} variant='solid'>{t('dashboard.btn_delete')}</Button>
                            </form>
                        </ModalFooter>
                    </ModalContent>
                </Modal >
                {/* Board pozíció módosítása */}
                < Modal isOpen={isOpenBoardEditPos} onClose={handleCloseBoardEditPos} >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>
                            <Text>{t('projectlist.modal_edit_position')}</Text>
                        </ModalHeader>
                        <ModalCloseButton />
                        <form onSubmit={handleSubmitBoardEditPos(handleBoardPosition)}>
                            <ModalBody>
                                <Text mb={5}>{t('projectlist.modal_edit_position')}</Text>
                                <Select tabIndex={1} {...registerBoardEditPos("boardId", { required: true })}>
                                    {otherBoards.map((i, k) => {
                                        return <option key={k} value={i.id}>{i.title}</option>
                                    })}
                                </Select>
                            </ModalBody>
                            <ModalFooter>
                                <Button tabIndex={2} isLoading={isSubmittingBoardEditPos} type="submit" colorScheme='blue' mr={3} variant='solid'>{t('projectlist.btn_edit')}</Button>
                                <Button tabIndex={3} onClick={onCloseBoardEditPos}>
                                    {t('dashboard.btn_cancel')}
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
                            <Text>{t('projectlist.modal_add_subtask')}</Text>
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
                                <Button isLoading={isSubmittingAddSubtask} type="submit" colorScheme='blue' mr={3} variant='solid'>{t('projectlist.btn_add')}</Button>
                                <Button onClick={onCloseAddSubtask}>
                                    {t('dashboard.btn_cancel')}
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
                            <BreadcrumbLink as={Link} to='/dashboard'>{t('dashboard.dashboard_title')}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem isCurrentPage>
                            <BreadcrumbLink href='#'>{project!.title} ({t('projectlist.label_kanban_table')})</BreadcrumbLink>
                        </BreadcrumbItem>
                    </Breadcrumb>
                    <HStack>
                        <InputGroup w="300px" >
                            <InputRightElement pointerEvents='none'>
                                <FaSearch />
                            </InputRightElement>
                            <Input variant={"filled"} onChange={debouncedChangeHandler} type='text' placeholder={t('projectlist.label_search_task')} />
                        </InputGroup>
                        <AvatarGroup userSelect={'none'} size={"md"}>
                            {selectedPeople && selectedPeople.map((i, k) => {
                                return <Tooltip label={i.label}><Avatar borderWidth={3} borderColor={i.selected ? "blue" : ""} onClick={() => handleFilterPeople(i.id)} _hover={{ opacity: 0.8, cursor: "pointer" }} name={i.label} key={k} /></Tooltip>
                            })}
                        </AvatarGroup>
                        <ChakraSelect components={customComponents} placeholder={t('projectlist.label_filter_priority')} onChange={(e) => handlePriorityFilter(e)} isClearable={true} variant='filled' options={priorities} name='priorities' />
                        <Checkbox isChecked={viewOld} onChange={() => setViewOld(!viewOld)}>{t('projectlist.label_show_expired_tasks')}</Checkbox>
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
                                                    {t('projectlist.menu_delete_board')}
                                                </MenuItem>
                                                <MenuItem onClick={() => handleBoardEditOpen(i.title, i.id)} icon={<FaPen />}>
                                                    {t('projectlist.menu_rename_board')}
                                                </MenuItem>
                                                <MenuItem onClick={() => handleBoardEditPosOpen(i.id)} icon={<MdNumbers />}>
                                                    {t('projectlist.menu_move_board')}
                                                </MenuItem>
                                            </MenuList>
                                        </Menu>
                                    </HStack>
                                    <Flex as={Button} gap={2} onClick={() => handleAddIssueOpen(i.id)} _hover={{ bg: (colorMode === 'light' ? "gray.100" : "gray.500"), cursor: 'pointer' }} bg={colorMode === 'light' ? "white" : '#333'} align="center" borderRadius={5} p={1} justify={"center"}>
                                        <FaPlus />
                                        <Text>{t('projectlist.board_add_issue')}</Text>
                                    </Flex>
                                    <Droppable droppableId={`${i.id}`} direction='vertical'>
                                        {(provided, snapshot) => (
                                            <Flex h="100%" {...provided.droppableProps}
                                                ref={provided.innerRef} gap={5} direction={"column"} bg={colorMode === 'light' ? (snapshot.isDraggingOver ? "gray.100" : "gray.200") : (snapshot.isDraggingOver ? "#333" : "#444")}>
                                                {
                                                    i.issues.filter(i => (priority === null || i.priority.id == priority)).filter(i => i.title.includes(search))
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
                            <Tooltip label={t('projectlist.label_add_board')}>
                                <Flex
                                    height="full"
                                    width="200px"
                                    bg="green.200"
                                    p={2}
                                    align={"center"}
                                    justify={"center"}
                                    _hover={{ cursor: "pointer", bg: "green.300" }}
                                    onClick={() => {
                                        if (IsUserProjectOwner(project!.participants)) {
                                            onOpen()
                                        }
                                    }}
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
