import React from 'react'
import { Flex, Heading, Text } from "@chakra-ui/react"
import { Link } from 'react-router-dom'
import { useRouteError } from 'react-router-dom'

export default function NotFound() {

    const error = useRouteError()

    return (
        <Flex w="full" direction={"column"} gap={10} justify={"center"} align={"center"}>
            <Heading>Hiba</Heading>
            <Link to={"/dashboard"}><Heading size="md" _hover={{ textDecor: "underline" }}>Vissza a főoldalra</Heading></Link>
        </Flex>
    )
}
