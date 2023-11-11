import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, Card, CardBody, CardHeader, Checkbox, Flex, Grid, HStack, Heading, Spinner } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getUserProjects } from "../api/project";
import { Select } from "chakra-react-select";
import { useState } from "react";
import { getProjectBoards } from "../api/projectBoard";
import { Bar, Pie } from "react-chartjs-2";
import { ArcElement, BarElement, CategoryScale, Legend, LinearScale, Title, Tooltip, Chart as ChartJS } from "chart.js";
import { Gantt, ViewMode } from "gantt-task-react";
import moment from "moment";
import "gantt-task-react/dist/index.css"
import TooltipContent from "../components/TooltipContent";
import TaskListHeader from "../components/TaskListHeader";
import TaskListTable from "../components/TaskListTable";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function StatisticsPage2() {

    const [projectId, setProjectId] = useState("")
    const [view, setView] = useState<string>(ViewMode.Month.valueOf())
    const [column, setColumn] = useState<string>("")

    const { data: projects, isLoading: isLoadingProjects } = useQuery({
        queryKey: ['getUserProjects'],
        queryFn: () => getUserProjects().then(res => res.data.map(i => {
            return { label: i.title, value: i.id }
        }))
    })

    const { data: board } = useQuery({
        queryKey: ['projectBoards', projectId],
        queryFn: () => getProjectBoards(projectId).then(res => res.data),
        enabled: !!projectId
    })

    const options: Array<{ label: string, value: string }> = [
        { label: "Napi", value: ViewMode.Day },
        { label: "Havi", value: ViewMode.Month },
        { label: 'Éves', value: ViewMode.Year }
    ]

    if (isLoadingProjects) {
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
                        <BreadcrumbLink href='/dashboard/tasks'>Statisztikák</BreadcrumbLink>
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
                        <BreadcrumbLink href='/dashboard/tasks'>Statisztikák</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>}
            <HStack>
                <Select variant="filled" onChange={(e) => setProjectId(e!.value)} placeholder={"Kérem válassza ki a projektet..."} options={projects} />
            </HStack>
            {board ?
                <>
                    <Grid p={10} gap={5} templateColumns={["repeat(1, 1fr)", "repeat(1, 1fr)", "repeat(2, 1fr)", "repeat(3, 1fr)"]}>
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
                                                data: board.map(i => i.issues.filter(j => j.priority).length),
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
                                                data: board.flatMap(b => b.issues.map(i => i.reporterName))
                                                    .reduce((acc: any, name) => (acc[name] = (acc[name] || 0) + 1, acc), {}),
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
                                                data: board.reduce((acc: any, b) => (b.issues.forEach(issue => issue.assignedPeople.forEach(a => acc[a.personName] = (acc[a.personName] || 0) + 1)), acc), {}),
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
                                                data: board.reduce((acc: any, b) => (b.issues.forEach(issue => acc[issue.issueType.name] = (acc[issue.issueType.name] || 0) + 1), acc), {}),
                                                backgroundColor: '#42a4ff',
                                            }
                                        ]
                                    }}
                                />
                            </CardBody>
                        </Card>
                    </Grid>
                    <Heading size="md">Gantt-diagram</Heading>
                    <HStack>
                        <Select variant="filled" onChange={(e) => setView(e ? e.value.valueOf() : "Day")} defaultValue={{ label: "Havi", value: ViewMode.Month.valueOf() }} options={options} />
                        <Checkbox onChange={() => setColumn(column ? "" : "100px")}>Bővebb leírás</Checkbox>
                    </HStack>
                    <HStack>
                        <Gantt TaskListTable={TaskListTable} TaskListHeader={TaskListHeader} TooltipContent={TooltipContent} listCellWidth={column} locale="hu" viewMode={view as ViewMode} tasks={board.flatMap(b =>
                            b.issues.map(i => {
                                const cDate = moment(i.created);
                                const dDate = moment(i.dueDate);
                                return {
                                    id: i.id,
                                    name: i.title,
                                    start: new Date(cDate.year(), cDate.month(), cDate.date()),
                                    end: new Date(dDate.year(), dDate.month(), dDate.date()),
                                    type: "task",
                                    dependencies: [i.parentIssueId],
                                    progress: Math.round((i.timeSpent / i.timeEstimate) * 100),
                                    styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' }
                                };
                            })
                        )}
                            rowHeight={65}
                            columnWidth={400}
                        />
                    </HStack>
                </>
                : ""}
        </Flex>
    )
}
