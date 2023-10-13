import React from 'react'
import { Flex, Breadcrumb, Spinner, Heading, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/react"
import { useEffect } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getTasks } from '../api/project'
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
import { AiFillCheckSquare } from 'react-icons/ai'
import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon, Spacer, Text
} from '@chakra-ui/react'
import { FcHighPriority, FcLowPriority, FcMediumPriority } from 'react-icons/fc'

export default function MyTasks() {

    const [tasks, setTasks] = useState()
    const [number, setNumber] = useState()

    useEffect(() => {
        const fetchTasks = async () => {
            const result = await getTasks()
            setTimeout(() => {

                const data = result.data

                setNumber(data.length)

                const groupedData = {};

                data.forEach(item => {
                    const projectName = item.projectName;
                    if (!groupedData[projectName]) {
                        groupedData[projectName] = [];
                    }
                    groupedData[projectName].push(item);
                });

                setTasks(groupedData)

            }, 500)
        }
        fetchTasks()
    }, [])


    const handlePriorityIcon = (priority) => {
        if (priority === "Alacsony") {
            return <FcLowPriority color={priority.color} />
        }
        else if (priority === "Közepes") {
            return <FcMediumPriority color={priority.color} />
        }
        else if (priority === "Magas") {
            return <FcHighPriority color={priority.color} />
        }
        else if (priority === "Legalacsonyabb") {
            return <FcLowPriority color={priority.color} />
        }
        else if (priority === "Legmagasabb") {
            return <FcHighPriority color={priority.color} />
        }
    }


    if (tasks == null) {
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

            {Object.keys(tasks).map(projectName => (
                <Accordion allowToggle key={projectName}>
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
                                        {tasks[projectName].map((i, k) => (
                                            <Tr _hover={{ opacity: 0.6, cursor: "pointer" }} key={k}>
                                                <Td><AiFillCheckSquare color='#42a4ff' /></Td>
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
