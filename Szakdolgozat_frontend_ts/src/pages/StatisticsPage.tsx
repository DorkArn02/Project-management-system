import { Flex, Checkbox, Text, GridItem, Heading, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Select, HStack, Spinner, Grid } from "@chakra-ui/react"
import { useState } from "react"
import { useEffect } from "react"
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
import { useQuery } from "@tanstack/react-query"
import { getUserProjects } from "../api/project"

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function StatisticsPage() {

    const [id, setId] = useState("")
    const [tasks, setTasks] = useState()
    const [view, setView] = useState("Month")
    const [column, setColumn] = useState("")

    const [priorityChart, setPriorityChart] = useState<number[]>()
    const [reporterChart, setReporterChart] = useState()
    const [assignedChart, setAssignedChart] = useState()
    const [typeChart, setTypeChart] = useState()
    const [participants, setParticipants] = useState()

    const { isLoading, data: projects } = useQuery({
        queryKey: ['projects'],
        queryFn: () => getUserProjects().then(res => {
            const results = res.data
            setId(results.length > 0 ? results[0].id : "")
            return results
        }),
    })

    const { isLoading: isLoadingBoards, data: board, refetch } = useQuery({
        queryKey: ['projectBoards'],
        queryFn: () => getProjectBoards(id).then(res => res.data),
        enabled: id.length !== 0
    })

    useEffect(() => {
        if (board) {
            const originalData = board.map(i => i.issues.filter(j => j.priority).length);
            const data = Array.from({ length: 5 }, (_, index) => originalData[index] || 0);
            setPriorityChart(data)

            let people = board.map(b => b.issues.map(i => i.reporterName))

            let counts = {};

            for (let i = 0; i < people.length; i++) {
                for (let j = 0; j < people[i].length; j++) {
                    const name = people[i][j];
                    counts[name] = (counts[name] || 0) + 1;
                }
            }
            setReporterChart(counts)

            let tmp = []

            board.forEach(b => {
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

            const issueTypeCounts = {
                "Bug": 0,
                "Story": 0,
                "Task": 0,
            };

            // Végigiterálás a boardokon és az issuekön
            board.forEach((b) => {
                b.issues.forEach((issue) => {
                    const issueType = issue.issueType;
                    if (issueTypeCounts.hasOwnProperty(issueType.name)) {
                        issueTypeCounts[issueType.name]++;
                    }
                });
            });

            setTypeChart(issueTypeCounts)

            const peopleByName = {};

            board.forEach(b => {
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

        }
    }, [board])


    if (isLoading || isLoadingBoards || !board || !projects) {
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
                    <Grid gap={5} templateColumns={"repeat(3, 1fr)"}>
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
                                            label: 'Feladatok száma',
                                            data: assignedChart,
                                            backgroundColor: '#42a4ff',
                                        }
                                    ]
                                }}
                            />
                        </GridItem>
                        <GridItem>
                            <Heading size="md">Feladatok eloszlása típus szerint</Heading>
                            <Bar
                                options={{ responsive: false }}
                                data={{
                                    labels: ['Task', 'Story', 'Bug'],
                                    datasets: [
                                        {
                                            label: 'Feladatok száma',
                                            data: typeChart,
                                            backgroundColor: 'gray',
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
