import { Flex, Checkbox, Text, GridItem, Heading, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Select, HStack, Spinner, Grid } from "@chakra-ui/react"
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
import { Gantt } from "gantt-task-react"
import moment from "moment"
import "gantt-task-react/dist/index.css"

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
    const [tasks, setTasks] = useState()
    const [view, setView] = useState("Month")
    const [column, setColumn] = useState("")

    const [priorityChart, setPriorityChart] = useState()
    const [reporterChart, setReporterChart] = useState()
    const [assignedChart, setAssignedChart] = useState()

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const res = await getProjectBoards(id)
                setBoard(res.data);

                const originalData = res.data.map(i => i.issues.filter(j => j.priority).length);
                const data = Array.from({ length: 5 }, (_, index) => originalData[index] || 0);
                setPriorityChart(data)

                let people = res.data.map(b => b.issues.map(i => i.reporterName))

                let counts = {};

                for (let i = 0; i < people.length; i++) {
                    for (let j = 0; j < people[i].length; j++) {
                        const name = people[i][j];
                        counts[name] = (counts[name] || 0) + 1;
                    }
                }
                setReporterChart(counts)

                let tmp = []

                res.data.forEach(b => {
                    tmp.push(...b.issues);
                })

                let tmp2 = []

                tmp.forEach(i => {
                    const cDate = moment(i.created)
                    const dDate = moment(i.dueDate)

                    const obj = {
                        id: i.id,
                        name: i.title,
                        start: new Date(cDate.year(), cDate.month(), cDate.date()),
                        end: new Date(dDate.year(), dDate.month(), dDate.date()),
                        type: "task",
                        progress: Math.round((i.timeSpent / i.timeEstimate) * 100),
                        styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
                    };
                    tmp2.push(obj)
                })

                setTasks(tmp2)

                const peopleByName = {};

                res.data.forEach(b => {
                    b.issues.forEach(issue => {
                        issue.assignedPeople.forEach(a => {
                            const { personName } = a;
                            if (!peopleByName[personName]) {
                                peopleByName[personName] = 1
                            } else {
                                peopleByName[personName]++
                            }
                        })
                    });
                });

                setAssignedChart(peopleByName)

            } catch (e) {
                console.log(e)
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
                    <Link to={`/dashboard/${id}`}><Text _hover={{ textDecor: 'underline' }}>Ugrás a kiválasztott projektre</Text></Link>
                </HStack>
                {Object.entries(board).length !== 0 ?
                    <Grid templateColumns={"repeat(3, 1fr)"}>
                        <GridItem>
                            <Heading size="md">Feladatok eloszlása állapotok szerint</Heading>
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
                        </GridItem>
                        <GridItem>
                            <Heading size="md">Feladatok eloszlása prioritások szerint</Heading>
                            <Pie
                                options={{ responsive: false }}
                                data={{
                                    labels: ["Legalacsonyabb", "Alacsony", "Közepes", "Magas", "Legmagasabb"],
                                    datasets: [
                                        {
                                            label: 'Feladatok száma',
                                            data: priorityChart,
                                            backgroundColor: [
                                                'lightgreen',
                                                'green',
                                                'yellow',
                                                'orange',
                                                'red',
                                            ],
                                        }
                                    ]
                                }}
                            />
                        </GridItem>
                        <GridItem>
                            <Heading size="md">Feladatok eloszlása bejelentők szerint</Heading>
                            <Bar
                                options={{ responsive: false }}
                                data={{
                                    labels: participants,
                                    datasets: [
                                        {
                                            label: 'Bejelentett feladatok',
                                            data: reporterChart,
                                            backgroundColor: 'green',
                                        }
                                    ]
                                }}
                            />
                        </GridItem>
                        <GridItem>
                            <Heading size="md">Feladatok eloszlása hozzárendeltek szerint</Heading>
                            <Bar
                                options={{ responsive: false }}
                                data={{
                                    labels: participants,
                                    datasets: [
                                        {
                                            label: 'Hozzárendelt személyek',
                                            data: assignedChart,
                                            backgroundColor: '#42a4ff',
                                        }
                                    ]
                                }}
                            />
                        </GridItem>

                    </Grid>
                    : ""}
                <Heading size="md">Gantt-diagram</Heading>
                <HStack>
                    <Select variant="filled" width="250px" onChange={(e) => setView(e.target.value)} defaultValue={"Month"}>
                        <option value="Day">Napi</option>
                        <option value="Month">Havi</option>
                        <option value="Year">Éves</option>
                    </Select>
                    <Checkbox onChange={() => setColumn(column ? "" : "100px")}>Bővebb leírás</Checkbox>
                </HStack>
                <HStack overflow="auto">
                    {tasks && tasks.length > 0 ?
                        <Gantt listCellWidth={column} locale="hu" viewMode={view} tasks={tasks}
                            columnWidth={400}
                            rowHeight={40}
                            fontSize={12} />
                        : ""}
                </HStack>
            </Flex >
        )
}
