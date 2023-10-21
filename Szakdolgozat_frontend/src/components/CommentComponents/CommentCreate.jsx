import { useEditableControls, ButtonGroup, Button, Flex } from "@chakra-ui/react"

export const CommentCreate = () => {
    const {
        isEditing,
        getSubmitButtonProps,
        getCancelButtonProps,
        getEditButtonProps,
    } = useEditableControls()

    return isEditing ? (
        <ButtonGroup justifyContent='center' size='sm'>
            <Button {...getSubmitButtonProps()}>Elküldés</Button>
            <Button {...getCancelButtonProps()}>Visszavonás</Button>
        </ButtonGroup>
    ) : (
        <Flex justifyContent='center'>
            <Button {...getEditButtonProps()}>Módosítás</Button>
        </Flex>
    )
}