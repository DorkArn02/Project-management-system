import { Flex, Checkbox, Text, Heading, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Select, HStack, Spinner, Grid, Card, CardHeader, CardBody } from "@chakra-ui/react"
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
import { Gantt, ViewMode } from "gantt-task-react"
import moment from "moment"
import "gantt-task-react/dist/index.css"
import { useQuery } from "@tanstack/react-query"
import { getUserProjects } from "../api/project"
import { Select as ChakraSelect } from "chakra-react-select"

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

    const [id, setId] = useState<{ id: string, label: string, value: string }>()
    const [tasks, setTasks] = useState<Array<any>>()
    const [view, setView] = useState<ViewMode>(ViewMode.Month)
    const [column, setColumn] = useState<string>("")

    const [priorityChart, setPriorityChart] = useState<number[]>()
    const [reporterChart, setReporterChart] = useState()
    const [assignedChart, setAssignedChart] = useState()
    const [typeChart, setTypeChart] = useState()

    const { isLoading, data: projects } = useQuery({
        queryKey: ['projects'],
        queryFn: () => getUserProjects().then(res => {
            const results = res.data
            const obj = { id: results[0].id, label: results[0].title, value: results[0].id }
            if (obj) {
                setId(obj)
            }
            return results
        }),
        select: (data) => {
            const tmp: Array<{ id: string, label: string, value: string }> = []
            data.map(i => {
                tmp.push({ id: i.id, label: i.title, value: i.id })
            })
            return tmp
        }
    })

    const { isLoading: isLoadingBoards, data: board } = useQuery({
        queryKey: ['projectBoards'],
        queryFn: () => getProjectBoards(id!.value).then(res => res.data)
    })

    useEffect(() => {
        if (board) {
            const originalData = board.map(i => i.issues.filter(j => j.priority).length);
            const data = Array.from({ length: 5 }, (_, index) => originalData[index] || 0);
            setPriorityChart(data)

            let people = board.map(b => b.issues.map(i => i.reporterName))

            let counts: any = {};

            for (let i = 0; i < people.length; i++) {
                for (let j = 0; j < people[i].length; j++) {
                    const name = people[i][j];
                    counts[name] = (counts[name] || 0) + 1;
                }
            }
            setReporterChart(counts)

            let tmp: any = []

            board.forEach(b => {
                tmp.push(...b.issues);
            })

            let tmp2: Array<any> = []

            tmp.forEach((i: any) => {
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
    }, [board, id])

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
                    <ChakraSelect variant="filled" defaultValue={id} options={projects} />
                    <Link to={`/dashboard/${id?.value}`}><Text _hover={{ textDecor: 'underline' }}>Ugrás a kiválasztott projektre</Text></Link>
                </HStack>
                {Object.entries(board).length !== 0 ?
                    <Grid gap={5} templateColumns={["repeat(1, 1fr)", "repeat(1, 1fr)", "repeat(2, 1fr)", "repeat(3, 1fr)"]}>
                        <Card variant={"filled"} align="center">
                            <CardHeader>
                                <Heading size="md">Feladatok eloszlása állapotok szerint</Heading>
                            </CardHeader>
                            <CardBody>
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
                            </CardBody>
                        </Card>
                        <Card variant={"filled"} align="center">
                            <CardHeader>
                                <Heading size="md">Feladatok eloszlása prioritások szerint</Heading>
                            </CardHeader>
                            <CardBody>
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
                            </CardBody>
                        </Card>
                        <Card variant={"filled"} align="center">
                            <CardHeader>
                                <Heading size="md">Feladatok eloszlása bejelentők szerint</Heading>
                            </CardHeader>
                            <CardBody>
                                <Bar

                                    options={{ responsive: false }}
                                    data={{
                                        datasets: [
                                            {
                                                label: 'Bejelentett feladatok',
                                                data: reporterChart,
                                                backgroundColor: '#42a4ff',
                                            }
                                        ]
                                    }}
                                />
                            </CardBody>

                        </Card>
                        <Card variant={"filled"} align="center">
                            <CardHeader>
                                <Heading size="md">Feladatok eloszlása hozzárendeltek szerint</Heading>
                            </CardHeader>
                            <CardBody>
                                <Bar
                                    options={{ responsive: false }}
                                    data={{
                                        datasets: [
                                            {
                                                label: 'Feladatok száma',
                                                data: assignedChart,
                                                backgroundColor: '#42a4ff',
                                            }
                                        ]
                                    }}
                                />
                            </CardBody>
                        </Card>
                        <Card variant={"filled"} align="center">
                            <CardHeader>
                                <Heading size="md">Feladatok eloszlása típus szerint</Heading>
                            </CardHeader>
                            <CardBody>
                                <Bar
                                    options={{ responsive: false }}
                                    data={{
                                        labels: ['Task', 'Story', 'Bug'],
                                        datasets: [
                                            {
                                                label: 'Feladatok száma',
                                                data: typeChart,
                                                backgroundColor: '#42a4ff',
                                            }
                                        ]
                                    }}
                                />
                            </CardBody>
                        </Card>
                    </Grid>
                    : ""}
                <Heading size="md">Gantt-diagram</Heading>
                <HStack>
                    <Select variant="filled" width="250px" onChange={(e) => setView((e.target.value as ViewMode))} defaultValue={"Month"}>
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
                            fontSize={"12"} />
                        : ""}
                </HStack>
            </Flex >
        )
}
