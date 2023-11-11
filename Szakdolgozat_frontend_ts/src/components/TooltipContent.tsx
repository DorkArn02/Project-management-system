import { Stack, Text, useColorMode } from '@chakra-ui/react';
import { Task } from 'gantt-task-react';
import moment from 'moment';
import React from 'react'

const TooltipContent: React.FC<{ task: Task; fontSize: string; fontFamily: string; }> = ({
    task,
    fontSize,
    fontFamily
}) => {

    const { colorMode } = useColorMode()

    return (
        <Stack fontFamily={fontFamily} fontSize={fontSize} border="1px solid gray" p={5} bg={colorMode === 'dark' ? '#333' : "white"}>
            <Text fontWeight={"bold"}>{task.name}</Text>
            <Text>Kezdő dátum: {moment(task.start).format("yyyy-MM-DD")}</Text>
            <Text>Határidő: {moment(task.end).format("yyyy-MM-DD")}</Text>
        </Stack>
    )
}

export default TooltipContent