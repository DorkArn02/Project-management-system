import { useNavigate } from 'react-router-dom';
import {
    Box, Text, Avatar,
    IconButton, Button,
    Spacer,
    Stack,
    Flex,
    useColorMode,
    useDisclosure,
    Modal,
    ModalOverlay, ModalBody, ModalFooter, ModalContent, ModalHeader,
    ModalCloseButton,
    Popover, PopoverTrigger, PopoverHeader, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverBody, Divider, HStack
} from '@chakra-ui/react';

import { AiFillProject, AiOutlineProject } from "react-icons/ai";
import { FaArrowLeft, FaArrowRight, FaBell, FaMoon, FaSortAmountDown, FaSortAmountUpAlt, FaSun, FaTasks, FaTrash, FaUser } from "react-icons/fa";
import { useEffect } from 'react';
import { BiLogOut, BiStats } from 'react-icons/bi';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { deleteNotification, getNotifications } from '../api/user';
import { NotificationResponse } from '../interfaces/interfaces';
import { SignalRContext } from '../routes';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {

    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const storedValue = localStorage.getItem("opened");
    const initialValue = storedValue ? JSON.parse(storedValue) : false;
    const [opened, setOpened] = useState<boolean>(initialValue);
    const { colorMode, toggleColorMode } = useColorMode()
    const { isOpen, onOpen, onClose } = useDisclosure()


    useEffect(() => {
        if (!user) {
            navigate('/')
        }
    }, [user])

    const handleOpened = () => {
        setOpened(!opened)
        localStorage.setItem("opened", JSON.stringify(!opened))
    }

    const [notification, setNotification] = useState<Array<NotificationResponse>>()

    const loadNotifications = async () => {
        const result = await getNotifications()
        setNewNotifications(0)
        setNotification(result)
        localStorage.setItem('notification', "0")
    }


    const handleDeleteNotification = async (id: string) => {
        await deleteNotification(id)
        await loadNotifications()
    }

    const [newNotifications, setNewNotifications] = useState<number>(localStorage.getItem('notification') != null ? parseInt(localStorage.getItem('notification')!) : 0);
    const [sortOrder, setSortOrder] = useState<boolean>(true);

    SignalRContext.useSignalREffect(
        "SendMessage",
        () => {
            let newNumber = newNotifications + 1
            setNewNotifications(newNumber)
            localStorage.setItem('notification', `${newNumber}`)
        },
        []);

    const { t, ready } = useTranslation()

    if (user == null) {
        return ""
    } else if (ready)
        return (
            <>
                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>{t('users.label_logout_confirmation')}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Text>{t('users.label_logout_more')}</Text>
                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={logout} colorScheme='blue' mr={3} variant='solid'>{t('users.label_logout')}</Button>
                            <Button onClick={onClose}>
                                {t('dashboard.btn_cancel')}
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
                <Flex as={motion.div}
                    transition={"0.3s linear"} gap={"10px"} pl={opened ? "270px" : "100px"}>
                    <Box
                        w={opened ? "250px" : "60px"}
                        h="100vh"
                        zIndex={"10"}
                        bg={colorMode === 'light' ? "gray.200" : "#333"}
                        left="0"
                        top="0"
                        position={"fixed"}
                        display="flex"
                        flexDirection="column"
                        gap="10px"

                    >
                        <Stack justify={"center"} align="center" p={4} bg={colorMode === 'light' ? "gray.300" : "#444"}
                            direction={"row"}>
                            {opened ? <><AiFillProject color={colorMode === 'light' ? 'black' : 'white'} size={30} />
                                <Text fontSize="lg" fontWeight="bold">
                                    PM
                                </Text>
                                <Spacer />
                            </> : ""}
                            <IconButton aria-label='Open menu' onClick={handleOpened} icon={opened ? <FaArrowLeft /> : <FaArrowRight />} />
                        </Stack>

                        <Stack gap={3} align="center" direction={"row"} p={2}>
                            <Avatar userSelect={"none"} name={`${user.lastName} ${user.firstName}`} borderRadius={10} />
                            <Stack display={opened ? "" : "none"} gap={"2px"}>
                                <Text fontWeight={"bold"}>{`${user.lastName} ${user.firstName}`}</Text>
                                <Text fontSize={"small"}>{`${user.email}`}</Text>
                            </Stack>
                        </Stack>
                        <Button onClick={() => navigate('/dashboard')} leftIcon={<AiOutlineProject />} variant={"ghost"}>{opened ? t('sidebar.projects_btn') : ""} </Button>
                        <Button onClick={() => navigate('/dashboard/tasks')} leftIcon={<FaTasks />} variant={"ghost"}>{opened ? t('sidebar.tasks_btn') : ""}</Button>
                        <Button onClick={() => navigate('/dashboard/stats')} variant={"ghost"} leftIcon={<BiStats />}>
                            {opened ? t('sidebar.stats_btn') : ""}
                        </Button>
                        <Spacer />
                        <Popover placement='right' isLazy>
                            <PopoverTrigger>
                                <Button onClick={() => loadNotifications()} leftIcon={<FaBell />} variant="ghost" >{opened ? t('sidebar.notifications_btn') : <>
                                    {(newNotifications != null && newNotifications != 0) ? <Box
                                        position="absolute"
                                        bottom="-4px"
                                        right="5px"
                                        borderRadius="50%"
                                        bg="red.500"
                                        width="20px"
                                        height="20px"
                                        display="flex"
                                        justifyContent="center"
                                        alignItems="center"
                                    >
                                        <Text color="white" fontSize="xs">
                                            {newNotifications}
                                        </Text>
                                    </Box> : ""}
                                </>}</Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <PopoverHeader fontWeight='semibold'>
                                    <HStack>
                                        <Text>{t('sidebar.notifications_btn')} ({notification && notification.length})</Text>
                                        <IconButton position={"absolute"} size="sm" right={"12%"} variant="ghost" onClick={() => setSortOrder(!sortOrder)} aria-label='Sort by date' icon={sortOrder ? <FaSortAmountUpAlt /> : < FaSortAmountDown />} />
                                    </HStack>
                                </PopoverHeader>
                                <PopoverArrow />
                                <PopoverCloseButton size={"md"} />
                                <PopoverBody>
                                    <Stack maxHeight={"350px"} overflowY={"scroll"}>
                                        {notification && notification
                                            .sort((a, b) => {
                                                const order = sortOrder === true ? 1 : -1;
                                                return order * (new Date(b.created).valueOf() - new Date(a.created).valueOf());
                                            })
                                            .map((i, k) => {
                                                return <>
                                                    <HStack align="baseline">
                                                        <Text key={k}>{i.content}</Text>
                                                        <IconButton aria-label='Delete notification' onClick={() => handleDeleteNotification(i.id)} size="sm" variant="ghost" icon={<FaTrash />} />
                                                    </HStack>
                                                    <HStack>
                                                        <Link to={`${i.projectId}`}><Text _hover={{ textDecor: "underline", color: "lightblue" }}>{i.projectName}</Text></Link>
                                                        <Spacer />
                                                        <Text align="right">{moment(i.created).fromNow()}</Text>
                                                    </HStack>
                                                    <Divider />
                                                </>
                                            })}
                                    </Stack>
                                </PopoverBody>
                            </PopoverContent>
                        </Popover>

                        <Button onClick={() => navigate('/dashboard/myprofile')} leftIcon={<FaUser />} variant="ghost" >{opened ? t('sidebar.user_btn') : ""}</Button>
                        <Button onClick={toggleColorMode} leftIcon={colorMode === 'light' ? <FaSun /> : <FaMoon />} variant="ghost">{opened ? t('sidebar.theme_btn') : ""}</Button>
                        <Button onClick={onOpen} variant={"ghost"} leftIcon={<BiLogOut />} mb={2}>{opened ? t('sidebar.logout_btn') : ""}</Button>
                    </Box>
                    <Outlet />
                </Flex>
            </>
        )
}