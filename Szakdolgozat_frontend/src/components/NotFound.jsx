import React from 'react'
import { Flex, Heading } from "@chakra-ui/react"
import { Link } from 'react-router-dom'

export default function NotFound() {
    return (
        <Flex direction={"column"} gap={10} justify={"center"} align={"center"}>
            <Heading>Az oldal nem található</Heading>
            <Link to={"/dashboard"}><Heading size="md" _hover={{ textDecor: "underline" }}>Vissza a főoldalra</Heading></Link>
        </Flex>
    )
}
