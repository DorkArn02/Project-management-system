import { Flex, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Select, HStack, Spinner, Grid } from "@chakra-ui/react"
import { useState } from "react"
import { useEffect } from "react"
import { useNavigation } from "react-router-dom"
import { useLoaderData } from "react-router-dom"
import { Link } from "react-router-dom"
import { getProjectBoards } from "../api/projectBoard"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function StatisticsBoard() {

    const projects = useLoaderData()
    const navigation = useNavigation()

    const [id, setId] = useState(projects.length !== 0 ? projects[0].id : "")
    const [board, setBoard] = useState({})

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const res = await getProjectBoards(id)
                setBoard(res.data);
            } catch {
                console.log("Error")
            }
        }

        fetchBoards()
    }, [id])
    const participants = projects.filter(i => i.id === id)[0].participants.map(i => `${i.lastName} ${i.firstName}`)

    if (navigation.state === 'loading') {
        return <Flex h="100vh" w="full" align="center" justify="center">
            <Spinner size="xl" color="green.500" />
        </Flex>
    }
    else
        return (
            <Flex w="full" gap={"20px"} flexDirection={"column"} mt={5}>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <BreadcrumbLink as={Link} to='/dashboard'>Áttekintő</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink href='/dashboard/tasks'>Statisztikák</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>
                <HStack>
                    <Select variant={'filled'} onChange={(e) => setId(e.target.value)} w="300px">
                        {projects.map((i, k) => {
                            return <option value={i.id} key={k}>{i.title}</option>
                        })}
                    </Select>
                </HStack>
                {Object.entries(board).length !== 0 ?
                    <Grid templateColumns={"repeat(3, 1fr)"}>
                        <Bar
                            options={{ responsive: false }}
                            data={{
                                labels: board.map(i => i.title),
                                datasets: [
                                    {
                                        label: 'Feladatok száma',
                                        data: board.map(i => i.issues.length),
                                        backgroundColor: '#42a4ff',
                                    },
                                ]
                            }}
                        />
                        <Pie
                            options={{ responsive: false }}
                            data={{
                                labels: ["Legalacsonyabb", "Alacsony", "Közepes", "Magas", "Legmagasabb"],
                                datasets: [
                                    {
                                        label: 'Feladatok száma',
                                        data: board.map(i => i.issues.filter(j => j.priority).length),
                                        backgroundColor: [
                                            "lightgreen",
                                            "green",
                                            "yellow",
                                            "red",
                                            "red"
                                        ]
                                    }
                                ]
                            }}
                        />
                        <Bar
                            options={{ responsive: false }}
                            data={{
                                labels: participants,
                                datasets: [
                                    {
                                        label: 'Bejelentett feladatok',
                                        data: [1, 2, 3, 4],
                                        backgroundColor: 'green',
                                    }
                                ]
                            }}
                        />

                    </Grid>
                    : ""}
            </Flex>
        )
}
