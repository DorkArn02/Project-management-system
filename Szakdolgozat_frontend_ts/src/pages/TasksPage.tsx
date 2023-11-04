import { Flex, Breadcrumb, Spinner, Heading, BreadcrumbItem, BreadcrumbLink, HStack, IconButton, Select } from "@chakra-ui/react"
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
} from '@chakra-ui/react'
import moment from 'moment'
import { AiFillBug, AiFillCheckSquare, AiOutlineFilter } from 'react-icons/ai'
import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon, Spacer
} from '@chakra-ui/react'
import { FcHighPriority, FcLowPriority, FcMediumPriority } from 'react-icons/fc'
import { getTasks } from "../api/project"
import { useQuery } from "@tanstack/react-query"
import { Task } from "../interfaces/interfaces"
import { BsFillBookmarkFill } from "react-icons/bs"

type GroupedData = {
    [projectName: string]: Array<Task>;
}
export default function TasksPage() {

    const [number, setNumber] = useState<number>()

    const { data: tasks, isLoading } = useQuery({
        queryKey: ['getUserTasks'],
        queryFn: () => getTasks().then(res => {
            setNumber(res.data.length)
            return res.data
        }),
        select: (data) => {
            const groupedData: GroupedData = {};
            data.forEach(item => {
                const projectName = item.projectName;
                if (!groupedData[projectName]) {
                    groupedData[projectName] = [];
                }
                groupedData[projectName].push(item);
            });
            return groupedData
        }
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
    }

    if (isLoading) {
        return <Flex h="100vh" w="full" align="center" justify="center">
            <Spinner size="xl" color="green.500" />
        </Flex>
    }
    return (
        <Flex w="full" gap={"20px"} flexDirection={"column"} mt={5}>
            <Breadcrumb>
                <BreadcrumbItem>
                    <BreadcrumbLink as={Link} to='/dashboard'>Áttekintő</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                    <BreadcrumbLink href='/dashboard/tasks'>Saját feladatok</BreadcrumbLink>
                </BreadcrumbItem>
            </Breadcrumb>

            <Heading size={"md"}>Összesen {number} db feladathoz van hozzárendelve.</Heading>

            {Object.keys(tasks!).map(projectName => (
                <Accordion allowToggle key={projectName} >
                    <AccordionItem>
                        <AccordionButton>
                            <Heading mb={2} textTransform={"capitalize"} size="md">
                                {projectName}
                            </Heading>
                            <Spacer />
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel>
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
                                        {tasks![projectName].map((i, k) => (
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
                        </AccordionPanel>
                    </AccordionItem>

                </Accordion>
            ))
            }
        </Flex >
    )
}
