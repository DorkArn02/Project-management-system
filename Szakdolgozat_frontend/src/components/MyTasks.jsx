import React from 'react'
import { Flex, Breadcrumb, Spinner, Heading, IconButton, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/react"
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
import { FaArrowRight } from 'react-icons/fa'
import { AiFillCheckSquare } from 'react-icons/ai'
export default function MyTasks() {

    const [tasks, setTasks] = useState()

    useEffect(() => {
        const fetchTasks = async () => {
            const result = await getTasks()
            setTimeout(() => {
                setTasks(result.data)
            }, 500)
        }
        fetchTasks()
    }, [])


    if (tasks == null) {
        return <Flex h="100vh" w="full" align="center" justify="center">
            <Spinner size="xl" color="green.500" />
        </Flex>
    }
    return (
        <Flex gap={"20px"} flexDirection={"column"} mt={5}>
            <Breadcrumb>
                <BreadcrumbItem>
                    <BreadcrumbLink as={Link} to='/dashboard'>Áttekintő</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                    <BreadcrumbLink href='/dashboard/tasks'>Saját feladatok</BreadcrumbLink>
                </BreadcrumbItem>
            </Breadcrumb>

            <Heading size={"md"}>Összesen {tasks.length} db feladathoz van hozzárendelve.</Heading>

            <TableContainer>
                <Table variant='striped'>
                    <Thead>
                        <Tr>
                            <Th>Típus</Th>
                            <Th>Projekt</Th>
                            <Th>Státusz</Th>
                            <Th>Feladat</Th>
                            <Th>Bejelentő</Th>
                            <Th>Határidő</Th>
                            <Th>Prioritás</Th>
                            <Th>Műveletek</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {tasks && tasks.map((i, k) => {
                            return <Tr key={k}>
                                <Td><AiFillCheckSquare color='blue' /></Td>
                                <Td>{i.projectName}</Td>
                                <Td>{i.boardName}</Td>
                                <Td>{i.title}</Td>
                                <Td>{i.reporterName}</Td>
                                <Td>{moment(i.dueDate).format("yyyy/MM/DD")}</Td>
                                <Td>{i.priority.name}</Td>
                                <Td>
                                    <IconButton colorScheme='green' icon={<FaArrowRight />} />
                                </Td>
                            </Tr>
                        })
                        }
                    </Tbody>
                </Table>
            </TableContainer>
        </Flex>
    )
}
