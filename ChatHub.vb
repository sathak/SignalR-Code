Imports System
Imports System.Collections.Generic
Imports System.Linq
Imports System.Data
Imports System.Web
Imports Microsoft.AspNet.SignalR.Hubs
Imports Microsoft.AspNet.SignalR
Imports System.Threading
Imports BusinessLayer

Public Class UserDetail
    Public Property ConnectionId() As String
        Get
            Return m_ConnectionId
        End Get
        Set
            m_ConnectionId = Value
        End Set
    End Property
    Private m_ConnectionId As String
    Public Property UserName() As String
        Get
            Return m_UserName
        End Get
        Set
            m_UserName = Value
        End Set
    End Property
    Private m_UserName As String
    Public Property authsession() As String
        Get
            Return m_authsession
        End Get
        Set
            m_authsession = Value
        End Set
    End Property
    Private m_authsession As String
    Public Property UserId() As Int32
        Get
            Return m_UserId
        End Get
        Set
            m_UserId = Value
        End Set
    End Property
    Private m_UserId As Int32
End Class

Public Class MessageDetail

    Public Property UserName() As String
        Get
            Return m_UserName
        End Get
        Set
            m_UserName = Value
        End Set
    End Property
    Private m_UserName As String

    Public Property Message() As String
        Get
            Return m_Message
        End Get
        Set
            m_Message = Value
        End Set
    End Property
    Private m_Message As String

End Class

Public Class UserConnectionIds

    Public Property UserName() As String
        Get
            Return m_UserName
        End Get
        Set
            m_UserName = Value
        End Set
    End Property
    Private m_UserName As String

    Public Property ConnectionId() As String
        Get
            Return m_ConnectionId
        End Get
        Set
            m_ConnectionId = Value
        End Set
    End Property
    Private m_ConnectionId As String
    Public Property UserId() As Int32
        Get
            Return m_UserId
        End Get
        Set
            m_UserId = Value
        End Set
    End Property
    Private m_UserId As Int32
End Class

Public Class ImageData
    Public Property Description() As String
        Get
            Return m_Description
        End Get
        Set
            m_Description = Value
        End Set
    End Property
    Private m_Description As String
    Public Property Filename() As String
        Get
            Return m_Filename
        End Get
        Set
            m_Filename = Value
        End Set
    End Property
    Private m_Filename As String
    Public Property Image() As String
        Get
            Return m_Image
        End Get
        Set
            m_Image = Value
        End Set
    End Property
    Private m_Image As String
End Class
Public Class ChatHub
    Inherits Hub
    Shared ConnectedUsers As New List(Of UserDetail)()
    Shared CurrentMessage As New List(Of MessageDetail)()
    Shared UserConnectionIds As New List(Of UserConnectionIds)()
    Shared ChatInfo As New ChatInfo()
    Public Overrides Function OnConnected() As System.Threading.Tasks.Task
        Return MyBase.OnConnected()
    End Function


    Public Sub Connect(userName As String, UserId As Int32)
        Dim id = Context.ConnectionId
        ChatInfo.InsertUserConnections("_uIns", userName, Context.ConnectionId, UserId)

        Dim _cUsers = ChatInfo.SelectConnectedUserBySession("_cSel_auth", Context.RequestCookies(".ASPXAUTH").Value.ToString())

        Dim cntvar = _cUsers.Tables(0)
        If cntvar.Rows.Count = 0 Then
            Dim _users = ChatInfo.InsertConnectedUser("_cIns", userName, id, Context.RequestCookies(".ASPXAUTH").Value.ToString(), UserId)
            ' send to caller
            Clients.Caller.onConnected(id, userName, _users.Tables(0), CurrentMessage)

            ' Dim userInfo = _users.Tables(0).AsEnumerable().Select(Function(p) New With {.userType = p.Field(Of String)("usertype"), .UserId = p.Field(Of Integer)("UserId")}).Where(Function(p) p.UserId = id).FirstOrDefault()

            Dim userInfo = (From p In _users.Tables(0).AsEnumerable()
                            Where p.Field(Of Integer)("UserId") = UserId
                            Select p.Field(Of String)("usertype")).ToList()

            Dim userConnections = (From p In _users.Tables(0).AsEnumerable()
                                   Select p.Field(Of String)("ConnectionId")).ToList()

            ' send to all except caller client
            Clients.All.onNewUserConnected(id, userName, _users.Tables(0))
        Else
            Dim euser = ChatInfo.SelectConnectedUserBySession("_cSel_auth", Context.RequestCookies(".ASPXAUTH").Value.ToString())
            Dim exisitngUser = euser.Tables(0).Rows(0)
            Dim ConnectedUserTable = ChatInfo.SelectConnectedUser("_cSel").Tables(0)
            Clients.Caller.onConnected(exisitngUser("ConnectionId"), userName, ConnectedUserTable, CurrentMessage)
            Clients.All.onNewUserConnected(exisitngUser("ConnectionId"), userName, ConnectedUserTable)
        End If

    End Sub

    Public Sub SendMessageToAll(userName As String, message As String)
        ' store last 100 messages in cache
        AddMessageinCache(userName, message)

        ' Broad cast message
        Clients.All.messageReceived(userName, message)

    End Sub

    Public Sub SendPrivateMessage(toUserId As String, message As String)

        Dim fromUserTable = ChatInfo.SelectConnectedUser("_cSel").Tables(0)
        Dim fromUserId = fromUserTable.AsEnumerable().Select(Function(p) p).Where(Function(p) (p("authsession")) = Context.RequestCookies(".ASPXAUTH").Value.ToString()).FirstOrDefault()
        Dim toUser = fromUserTable.AsEnumerable().Select(Function(p) p).Where(Function(p) (p("ConnectionId")) = toUserId).FirstOrDefault()
        Dim fromUser = fromUserTable.AsEnumerable().Select(Function(p) p).Where(Function(p) (p("ConnectionId")) = fromUserId("ConnectionId")).FirstOrDefault()

        If toUser IsNot Nothing AndAlso fromUser IsNot Nothing Then
            Dim _uConnectionIds = (From u In fromUserTable.AsEnumerable()
                                   Select u).Where(Function(p) (p("UserId")) = toUser("UserId")).ToList()
            ' Dim _uConnectionIds = fromUserTable.AsEnumerable().Select(Function(p) fromUserTable.Field(Of String)("ConnectionId")).Where(Function(p) (p("UserId")) = toUser("UserId")).ToList()
            Dim _ConnectionIds As IList(Of String) = (From u In _uConnectionIds.AsEnumerable()
                                                      Select u.Field(Of String)("ConnectionId")).ToList()
            Dim lastDate = ChatInfo.InsertMessagedetails("_mIns", fromUserId("UserId"), toUser("UserId"), message).Tables(0).Rows(0)("dt").ToString()
            Clients.All.getPrivateMessage(fromUserId("ConnectionId"), fromUserId("UserName"), message, toUserId, lastDate)


            Clients.Caller.sendPrivateMessage(toUserId, fromUserId("UserName"), message, lastDate)
        End If

    End Sub
    Public Sub LoadMessage(toUserId As String, minCount As Integer, maxCount As Integer)
        Dim fromUserTable = ChatInfo.SelectConnectedUser("_cSel").Tables(0)
        Dim fromUserId = fromUserTable.AsEnumerable().Select(Function(p) p).Where(Function(p) (p("authsession")) = Context.RequestCookies(".ASPXAUTH").Value.ToString()).FirstOrDefault()
        Dim toUser = fromUserTable.AsEnumerable().Select(Function(p) p).Where(Function(p) (p("ConnectionId")) = toUserId).FirstOrDefault()
        Dim chatdetails = ChatInfo.LoadMessages("_loadmsg", fromUserId("UserId"), toUser("UserId"), minCount, maxCount).Tables(0)
        Clients.Caller.LoadtoDisplay(chatdetails, toUserId)
    End Sub
    Public Sub DefaultLoadMessage(toUserId As String)
        Dim fromUserTable = ChatInfo.SelectConnectedUser("_cSel").Tables(0)
        Dim fromUserId = fromUserTable.AsEnumerable().Select(Function(p) p).Where(Function(p) (p("authsession")) = Context.RequestCookies(".ASPXAUTH").Value.ToString()).FirstOrDefault()
        Dim toUser = fromUserTable.AsEnumerable().Select(Function(p) p).Where(Function(p) (p("ConnectionId")) = toUserId).FirstOrDefault()
        Dim chatdetails = ChatInfo.LoadMessages("_loadmsg", fromUserId("UserId"), toUser("UserId"), 0, 10).Tables(0)
        Clients.Caller.LoadtoDisplay(chatdetails, toUserId)
    End Sub
    Public Sub OnDisconnect()
        Dim id = Context.ConnectionId
        Dim item = ChatInfo.SelectConnectedUserBySession("_cSel_auth", Context.RequestCookies(".ASPXAUTH").Value.ToString()).Tables(0).AsEnumerable().Select(Function(p) p).FirstOrDefault()
        If item IsNot Nothing Then

            ChatInfo.DeleteConnectedUser("_cDel_auth", Context.RequestCookies(".ASPXAUTH").Value.ToString())

            ChatInfo.DeleteUserConnectionsById("_uDel_Id", item("UserId"))
            Clients.All.onUserDisconnected(item("ConnectionId"), item("UserName"))
        End If

        Context.RequestCookies(".ASPXAUTH") = Nothing
        OnDisconnected(True)
    End Sub
    Public Overrides Function OnDisconnected(stopCalled As Boolean) As System.Threading.Tasks.Task
        Dim authSession = Context.RequestCookies(".ASPXAUTH")
        If authSession Is Nothing OrElse authSession.Value.ToString() = "" Then
            Return MyBase.OnDisconnected(stopCalled)
        Else
            Return MyBase.OnDisconnected(False)
        End If

    End Function
    Public Sub DeleteChatUser(UserId As Integer)
        ChatInfo.DeleteChatUserId("DelbyId", UserId)
        Dim UserTable = ChatInfo.SelectConnectedUser("_cSel").Tables(0)
        Clients.All.onCheckUsers(UserTable)
    End Sub
    Private Sub AddMessageinCache(userName As String, message As String)

        CurrentMessage.Add(New MessageDetail() With {
    .UserName = userName,
    .Message = message
})

        If CurrentMessage.Count > 100 Then
            CurrentMessage.RemoveAt(0)
        End If
    End Sub
End Class

