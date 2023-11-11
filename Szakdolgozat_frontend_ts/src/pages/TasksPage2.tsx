import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, Flex, HStack, Icon, Input, InputGroup, InputRightElement, Spinner, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { GroupBase, Select, SelectComponentsConfig, chakraComponents } from "chakra-react-select";
import { Link } from "react-router-dom";
import { getTasksByProjectId, getUserProjects } from "../api/project";
import { ReactNode, useState } from "react";
import moment from "moment";
import { FcHighPriority, FcLowPriority, FcMediumPriority } from "react-icons/fc";
import { AiFillBug, AiFillCheckSquare } from "react-icons/ai";
import { BsFillBookmarkFill } from "react-icons/bs";
import { FaSearch } from "react-icons/fa";
import { TbSubtask } from "react-icons/tb";

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


export default function TasksPage2() {

    const [projectId, setProjectId] = useState("")

    const [title, setTitle] = useState("")
    const [priority, setPriority] = useState<string | null>(null)
    const [type, setType] = useState<string | null>(null)
    const [startDate, setStartDate] = useState<string | null>(null)
    const [endDate, setEndDate] = useState<string | null>(null)

    const { data: projects } = useQuery({
        queryKey: ['getUserProjects'],
        queryFn: () => getUserProjects().then(res => res.data.map(i => {
            return { label: i.title, value: i.id }
        }))
    })

    const { data: tasks, isLoading } = useQuery({
        queryKey: ['getUserTasks', projectId],
        queryFn: () => getTasksByProjectId(projectId).then(res => res.data),
        enabled: !!projectId,
    })

    const handlePriorityIcon = (priority: string) => {
        if (priority === "Alacsony") {
            return <FcLowPriority />
        }
        else if (priority === "Közepes") {
            return <FcMediumPriority />
        }
        else if (priority === "Magas") {
            return <FcHighPriority />
        }
        else if (priority === "Legalacsonyabb") {
            return <FcLowPriority />
        }
        else if (priority === "Legmagasabb") {
            return <FcHighPriority />
        }
    }

    const handleIssueTypeIcon = (title: string) => {
        if (title === "Task") {
            return <AiFillCheckSquare color='#42a4ff' />
        }
        else if (title === "Bug") {
            return <AiFillBug color='red' />
        }
        else if (title == "Story") {
            return <BsFillBookmarkFill color='green' />
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
        { value: "4", label: "Subtask", icon: <Icon mr={2} as={TbSubtask} color='#42a4ff' /> },
    ]

    if (isLoading) {
        return <Flex h="100vh" w="full" align="center" justify="center">
            <Spinner size="xl" color="green.500" />
        </Flex>
    }
    return (
        <Flex w="full" gap={"20px"} flexDirection={"column"} mt={5}>
            {projectId ?
                <Breadcrumb>
                    <BreadcrumbItem>
                        <BreadcrumbLink as={Link} to='/dashboard'>Áttekintő</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem >
                        <BreadcrumbLink href='/dashboard/tasks'>Saját feladatok</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink>{projects?.filter(i => i.value === projectId)[0].label}</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>
                :
                <Breadcrumb>
                    <BreadcrumbItem>
                        <BreadcrumbLink as={Link} to='/dashboard'>Áttekintő</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink href='/dashboard/tasks'>Saját feladatok</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>}


            <HStack>
                <Select variant="filled" onChange={(e) => setProjectId(e!.value)} placeholder={"Kérem válassza ki a projektet..."} options={projects} />
            </HStack>
            {tasks ?
                <>
                    <HStack>
                        <InputGroup w="300px" >
                            <InputRightElement pointerEvents='none'>
                                <FaSearch />
                            </InputRightElement>
                            <Input onChange={(e) => setTitle(e.target.value)} variant={"filled"} type='text' placeholder='Feladat keresése...' />
                        </InputGroup>
                        <Select components={customComponents} isClearable={true} onChange={(e) => e ? setPriority(e.value) : setPriority(null)} variant="filled" placeholder={"Szűrés prioritás szerint..."} options={priorities} />
                        <Select components={customComponents} isClearable={true} onChange={(e) => e ? setType(e.value) : setType(null)} variant="filled" placeholder={"Szűrés feladattípus szerint..."} options={issueTypes} />
                    </HStack>
                    <HStack>
                        <Input onChange={(e) => setStartDate(e.target.value)} variant="filled" w="200px" type="date" />
                        <Text>-</Text>
                        <Input onChange={(e) => setEndDate(e.target.value)} variant="filled" w="200px" type="date" />
                    </HStack>

                    <TableContainer>
                        <Table variant='striped'>
                            <Thead>
                                <Tr>
                                    <Th>Típus</Th>
                                    <Th>Státusz</Th>
                                    <Th>Feladat</Th>
                                    <Th>Bejelentő</Th>
                                    <Th>Határidő</Th>
                                    <Th>Prioritás</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {tasks.filter(i => i.title.includes(title)).filter(i => (priority == null || i.priority.id == parseInt(priority))).filter(i => (type == null || i.issueType.id == parseInt(type)))
                                    .filter(i => (startDate == null || moment(i.dueDate).isAfter(startDate)))
                                    .filter(i => (endDate == null || moment(i.dueDate).isBefore(endDate)))
                                    .map((i, k) => (
                                        <Tr _hover={{ opacity: 0.6, cursor: "pointer" }} key={k}>
                                            <Td>{handleIssueTypeIcon(i.issueType.name)}</Td>
                                            <Td>{i.boardName}</Td>
                                            <Td>{i.title}</Td>
                                            <Td>{i.reporterName}</Td>
                                            <Td>{moment(i.dueDate).format("YYYY/MM/DD")}</Td>
                                            <Td>{handlePriorityIcon(i.priority.name)}</Td>
                                        </Tr>
                                    ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </>
                : ""}
        </Flex>
    )
}
