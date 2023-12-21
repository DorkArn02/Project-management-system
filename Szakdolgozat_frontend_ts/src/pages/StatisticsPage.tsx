import { Avatar, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Card, CardBody, CardHeader, Checkbox, Flex, Grid, HStack, Heading, Progress, Spinner, Table, Tooltip as ChakraTooltip, TableContainer, Tbody, Td, Text, Th, Thead, Tr, Stack, Divider } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getUserProjects } from "../api/project";
import { Select } from "chakra-react-select";
import { useState } from "react";
import { getProjectBoards } from "../api/projectBoard";
import { Bar, Doughnut } from "react-chartjs-2";
import { ArcElement, BarElement, CategoryScale, Legend, LinearScale, Title, Tooltip, Chart as ChartJS } from "chart.js";
import { Gantt, ViewMode } from "gantt-task-react";
import moment from "moment";
import "gantt-task-react/dist/index.css"
import TooltipContent from "../components/TooltipContent";
import TaskListHeader from "../components/TaskListHeader";
import TaskListTable from "../components/TaskListTable";
import { getAuditLogs } from "../api/audit";
import { useTranslation } from "react-i18next";

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

    const [projectId, setProjectId] = useState("")
    const [view, setView] = useState<string>(ViewMode.Month.valueOf())
    const [column, setColumn] = useState<string>("")

    const { data: projects, isLoading: isLoadingProjects } = useQuery({
        queryKey: ['getUserProjects'],
        queryFn: () => getUserProjects().then(res => res.data.map(i => {
            return { label: i.title, value: i.id, participants: i.participants }
        }))
    })

    const { data: board } = useQuery({
        queryKey: ['projectBoards', projectId],
        queryFn: () => getProjectBoards(projectId).then(res => res.data),
        enabled: !!projectId
    })

    const { data: logging } = useQuery({
        queryKey: ['projectLog', projectId],
        queryFn: () => getAuditLogs(projectId).then(res => res.data),
        enabled: !!projectId
    })
    const { t, ready } = useTranslation()

    const options: Array<{ label: string, value: string }> = [
        { label: t('stats.daily'), value: ViewMode.Day },
        { label: t('stats.monthly'), value: ViewMode.Month },
        { label: t('stats.yearly'), value: ViewMode.Year }
    ]


    if (isLoadingProjects && ready) {
        return <Flex h="100vh" w="full" align="center" justify="center">
            <Spinner size="xl" color="green.500" />
        </Flex>
    }
    return (
        <Flex w="full" gap={"20px"} flexDirection={"column"} mt={5}>
            {projectId ?
                <Breadcrumb>
                    <BreadcrumbItem>
                        <BreadcrumbLink as={Link} to='/dashboard'>{t('dashboard.dashboard_title')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem >
                        <BreadcrumbLink href='/dashboard/stats'>{t('stats.stats_stats')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink>{projects?.filter(i => i.value === projectId)[0].label}</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>
                :
                <Breadcrumb>
                    <BreadcrumbItem>
                        <BreadcrumbLink as={Link} to='/dashboard'>{t('dashboard.dashboard_title')}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem isCurrentPage>
                        <BreadcrumbLink href='/dashboard/tasks'>{t('stats.stats_stats')}</BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>}
            <HStack>
                <Select variant="filled" onChange={(e) => setProjectId(e!.value)} placeholder={t('stats.label_select_project')} options={projects} />
            </HStack>
            {board && board.length > 0 && board.reduce((total, column) => total + column.issues.length, 0) > 0 ?
                <>

                    <Grid p={10} gap={5} templateColumns={["repeat(1, 1fr)", "repeat(1, 1fr)", "repeat(2, 1fr)", "repeat(3, 1fr)"]}>
                        <Card variant={"filled"} align="center">
                            <CardHeader>
                                <Heading size="md">{t('stats.stats_distribution_by_state')}</Heading>
                            </CardHeader>
                            <CardBody>
                                <Bar
                                    options={{ responsive: false }}
                                    data={{
                                        labels: board.map(i => i.title),
                                        datasets: [
                                            {
                                                label: t('stats.number_of_tasks'),
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
                                <Heading size="md">{t('stats.stats_distribution_by_priority')}</Heading>
                            </CardHeader>
                            <CardBody>
                                <Doughnut
                                    options={
                                        {
                                            responsive: false, plugins:
                                            {
                                                legend: { position: "right" },
                                            }
                                        }
                                    }
                                    data={{
                                        labels: ["Legalacsonyabb", "Alacsony", "Közepes", "Magas", "Legmagasabb"],
                                        datasets: [
                                            {
                                                label: t('stats.number_of_tasks'),
                                                data: Array.from({ length: 5 }, (_, index) => (
                                                    board[index]?.issues.filter(j => j.priority).length || 0
                                                )),
                                                backgroundColor: [
                                                    'lightgreen',
                                                    'green',
                                                    'yellow',
                                                    'orange',
                                                    'red',
                                                ],
                                                borderWidth: 1
                                            }
                                        ],
                                    }}
                                />
                            </CardBody>
                        </Card>
                        <Card variant={"filled"} align="center">
                            <CardHeader>
                                <Heading size="md">{t('stats.stats_distribution_by_reporter')}</Heading>
                            </CardHeader>
                            <CardBody>
                                <Bar
                                    options={{ responsive: false }}
                                    data={{
                                        datasets: [
                                            {
                                                label: t('stats.reported_tasks'),
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
                            <CardHeader textAlign={"center"}>
                                <Heading size="md">{t('stats.stats_distribution_by_assignees')}</Heading>
                            </CardHeader>
                            <CardBody>
                                <TableContainer>
                                    <Table variant='simple'>
                                        <Thead>
                                            <Tr>
                                                <Th textAlign={"center"}>{t('stats.assigned_person')}</Th>
                                                <Th textAlign={"center"}>{t('stats.distribution')}</Th>
                                                <Th textAlign={"center"} isNumeric>{t('stats.tasks')}</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {projects?.filter(i => i.value == projectId)[0].participants.map((i, k) => {
                                                const personName = `${i.lastName} ${i.firstName}`;
                                                const tasksCount = board.flatMap((b) =>
                                                    b.issues.flatMap((i) =>
                                                        i.assignedPeople.filter((person) => person.personName === personName).length
                                                    )
                                                ).reduce((sum, count) => sum + count, 0);
                                                const totalTasks = board.flatMap(b => b.issues).flatMap(b => b.assignedPeople).length

                                                return <Tr key={k}>
                                                    <Td>
                                                        <HStack>
                                                            <Avatar size="sm" name={`${i.lastName} ${i.firstName}`} />
                                                            <Text>{personName}</Text>
                                                        </HStack>
                                                    </Td>
                                                    <Td>
                                                        <ChakraTooltip label={`${Math.round((tasksCount / totalTasks) * 100)}% ${t('stats.distribution')}`}>
                                                            <Progress hasStripe value={(tasksCount / totalTasks) * 100} />
                                                        </ChakraTooltip>
                                                    </Td>
                                                    <Td>
                                                        <Text>{tasksCount}</Text>
                                                    </Td>
                                                </Tr>
                                            })}
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            </CardBody>
                        </Card>
                        <Card variant={"filled"} align="center">
                            <CardHeader>
                                <Heading size="md">{t('stats.stats_distribution_by_issue_type')}</Heading>
                            </CardHeader>
                            <CardBody>
                                <Bar
                                    options={{ responsive: false }}
                                    data={{
                                        labels: ['Task', 'Story', 'Bug', 'Subtask'],
                                        datasets: [
                                            {
                                                label: t('stats.number_of_tasks'),
                                                data: board.reduce((acc: any, b) => (b.issues.forEach(issue => acc[issue.issueType.name] = (acc[issue.issueType.name] || 0) + 1), acc), {}),
                                                backgroundColor: '#42a4ff',
                                            }
                                        ]
                                    }}
                                />
                            </CardBody>
                        </Card>
                        <Card variant={"filled"} align="center">
                            <CardHeader>
                                <Heading size="md">{t('stats.stats_last_activity')}</Heading>
                            </CardHeader>
                            <CardBody maxH={"400px"} overflow={"auto"}>
                                {logging ?
                                    <Stack>
                                        {logging.length > 0 ? logging?.map((i, k) => {
                                            return <><HStack key={k}>
                                                <ChakraTooltip label={i.personName}>
                                                    <Avatar name={i.personName} />
                                                </ChakraTooltip>
                                                <Stack spacing={"1px"}>
                                                    <Text>{i.content}</Text>
                                                    <Text>{moment(i.created).fromNow()}</Text>
                                                </Stack>
                                            </HStack>
                                                <Divider />
                                            </>
                                        }) : <Text>{t('stats.stats_no_activities')}</Text>}
                                    </Stack>
                                    : ""}
                            </CardBody>
                        </Card>
                    </Grid>
                    <Heading size="md">{t('stats.gantt')}</Heading>
                    <HStack>
                        <Select variant="filled" onChange={(e) => setView(e ? e.value.valueOf() : "Day")} defaultValue={{ label: t('stats.monthly'), value: ViewMode.Month.valueOf() }} options={options} />
                        <Checkbox onChange={() => setColumn(column ? "" : "100px")}>{t('stats.more_details')}</Checkbox>
                    </HStack>
                    <HStack>
                        <Gantt TaskListTable={TaskListTable} TaskListHeader={TaskListHeader} TooltipContent={TooltipContent} listCellWidth={column} locale="hu" preStepsCount={0} viewMode={view as ViewMode} tasks={board.flatMap(b =>
                        (b.issues.map(i => {
                            const cDate = moment(i.created);
                            const dDate = moment(i.dueDate);
                            console.log(i)
                            return {
                                id: i.id,
                                name: i.title,
                                start: new Date(cDate.year(), cDate.month(), cDate.date()),
                                end: new Date(dDate.year(), dDate.month(), dDate.date()),
                                type: "task",
                                dependencies: [i.parentIssueId!],
                                progress: Math.round((i.timeSpent / i.timeEstimate) * 100),
                                styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' }
                            };
                        })
                        )
                        )}
                            rowHeight={65}
                            columnWidth={400}
                        />
                    </HStack>
                </>
                : ""
            }
        </Flex >
    )
}
