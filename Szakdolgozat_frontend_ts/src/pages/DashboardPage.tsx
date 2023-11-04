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
import { FaArrowLeft, FaArrowRight, FaBell, FaMoon, FaSun, FaTasks, FaTrash, FaUser } from "react-icons/fa";
import { useEffect } from 'react';
import { BiLogOut, BiStats } from 'react-icons/bi';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
//import { deleteNotification, getNotifications } from '../api/notifications';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { deleteNotification, getNotifications } from '../api/user';
import { NotificationResponse } from '../interfaces/interfaces';

export default function Dashboard() {

    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const [opened, setOpened] = useState<boolean>(JSON.parse(localStorage.getItem("opened") || ""))
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
        setNotification(result)
    }


    const handleDeleteNotification = async (id: string) => {
        await deleteNotification(id)
        await loadNotifications()
    }

    if (user == null) {
        return ""
    } else
        return (
            <>

                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Megerősítés</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Text>Biztos kijelentkezel?</Text>
                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={logout} colorScheme='blue' mr={3} variant='solid'>Kijelentkezés</Button>
                            <Button onClick={onClose}>
                                Visszavonás
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
                        <Button onClick={() => navigate('/dashboard')} leftIcon={<AiOutlineProject />} variant={"ghost"}>{opened ? "Projektek" : ""} </Button>
                        <Button onClick={() => navigate('/dashboard/tasks')} leftIcon={<FaTasks />} variant={"ghost"}>{opened ? "Saját feladataim" : ""}</Button>
                        <Button onClick={() => navigate('/dashboard/stats')} variant={"ghost"} leftIcon={<BiStats />}>
                            {opened ? "Statisztikák" : ""}
                        </Button>
                        <Spacer />
                        <Popover placement='right' isLazy>
                            <PopoverTrigger>
                                <Button onClick={() => loadNotifications()} leftIcon={<FaBell />} variant="ghost" >{opened ? "Értesítések" : ""}</Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <PopoverHeader fontWeight='semibold'>
                                    <Text>Értesítések ({notification && notification.length})</Text>
                                </PopoverHeader>
                                <PopoverArrow />
                                <PopoverCloseButton />
                                <PopoverBody>
                                    <Stack maxHeight={"350px"} overflowY={"scroll"}>
                                        {notification && notification.map((i, k) => {
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

                        <Button onClick={() => navigate('/dashboard/myprofile')} leftIcon={<FaUser />} variant="ghost" >{opened ? "Saját fiók" : ""}</Button>
                        <Button onClick={toggleColorMode} leftIcon={colorMode === 'light' ? <FaSun /> : <FaMoon />} variant="ghost">{opened ? "Téma váltása" : ""}</Button>
                        <Button onClick={onOpen} variant={"ghost"} leftIcon={<BiLogOut />} mb={2}>{opened ? "Kijelentkezés" : ""}</Button>
                    </Box>
                    <Outlet />
                </Flex>
            </>
        )
}
