import { useCallback, useContext, useEffect, useState } from "react"
import { ChatContext } from "./ChatContext.js"
import { AuthContext } from "./AuthContext.js";
import toast from "react-hot-toast";

export const ChatProvider = ({ children }) => {

    const [messages,setMessages] = useState([]);
    const [users,setUsers] = useState([])
    const [selectedUser,setSelectedUser] = useState(null)
    const [unseenMessages,setUnseenMessages] = useState({})

    const {socket, axios} = useContext(AuthContext);

    const getUsers = useCallback(async () => {
        try{
            const { data } = await axios.get("/api/messages/users");
            if(data.success){
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages)
            }
        }
        catch(error){
            toast.error(error.message)
        }
    }, [axios])

    const getMessages = useCallback(async (userId) => {
        try{
            const { data } = await axios.get(`/api/messages/${userId}`);
            if(data.success){
                setMessages(data.messages)
            }
        }
        catch(error){
            toast.error(error.message)
        }
    }, [axios])

    const sendMessage = async (messageData) => {
        try{
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`,messageData)
            if(data.success){
                setMessages((prevMessages) => [...prevMessages,data.newMessage])
            }
            else{
                toast.error(data.message)
            }
        }
        catch(error) {
            toast.error(error.message)
        }
    }

    const subscribeToMessages = useCallback(() => {
        if(!socket) return;

        socket.on("newMessage", (newMessage) => {
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen = true;
                setMessages((prevMessages)=> [...prevMessages,newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }
            else{
                setUnseenMessages((prevUnseenMessages) => ({
                    ...prevUnseenMessages,[newMessage.senderId] : 
                    prevUnseenMessages[newMessage.senderId] ? 
                    prevUnseenMessages[newMessage.senderId]+1 : 1
                }))
            }
        })
    }, [axios, selectedUser, socket])

    const unsubcribeFromMessages = useCallback(() => {
        if(socket) socket.off("newMessage");
    }, [socket])

    useEffect(()=>{
        subscribeToMessages()
        return ()=> unsubcribeFromMessages();
    }, [subscribeToMessages, unsubcribeFromMessages])

    const value = {
        messages,
        users,
        selectedUser,
        getUsers,
        getMessages,
        setMessages,
        sendMessage,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages
    }
    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}