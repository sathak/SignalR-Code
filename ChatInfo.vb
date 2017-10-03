Imports DataLayer.DbInteract
Imports log4net
Public Class ChatInfo
    Shared logger As ILog = log4net.LogManager.GetLogger(GetType(ChatInfo))
    Public Sub InsertUserConnections(ByVal Chat_For As String, ByVal UserName As String, ByVal ConnectionId As String, ByVal UserId As Integer)
        Try
            Dim paraName() As String = {"Chat_For", "UserName", "ConnectionId", "UserId"}
            Dim paraValue() As String = {Chat_For, UserName, ConnectionId, UserId}
            RunStoredProc(SqlQuery.S_CHAT, paraName, paraValue)
        Catch ex As Exception
            logger.Error(ex.Message, ex)
        End Try

    End Sub
    Public Function InsertConnectedUser(ByVal Chat_For As String, ByVal UserName As String, ByVal ConnectionId As String, ByVal authsession As String, ByVal UserId As Integer) As DataSet
        Dim dtConnectedUser As New DataSet
        Try
            Dim paraName() As String = {"Chat_For", "UserName", "ConnectionId", "authsession", "UserId"}
            Dim paraValue() As String = {Chat_For, UserName, ConnectionId, authsession, UserId}
            dtConnectedUser = Get_DataSet(SqlQuery.S_CHAT, paraName, paraValue)
            If dtConnectedUser.Tables.Count > 0 Then
                Return dtConnectedUser
            Else
                Return Nothing
            End If
        Catch ex As Exception
            logger.Error(ex.Message, ex)
            Return Nothing
        End Try

    End Function
    Public Function SelectConnectedUserBySession(ByVal Chat_For As String, ByVal authsession As String) As DataSet
        Dim dtConnectedUser As New DataSet
        Try
            Dim paraName() As String = {"Chat_For", "authsession"}
            Dim paraValue() As String = {Chat_For, authsession}
            dtConnectedUser = Get_DataSet(SqlQuery.S_CHAT, paraName, paraValue)
            If dtConnectedUser.Tables.Count > 0 Then
                Return dtConnectedUser
            Else
                Return Nothing
            End If
        Catch ex As Exception
            logger.Error(ex.Message, ex)
            Return Nothing
        End Try

    End Function
    Public Function SelectConnectedUser(ByVal Chat_For As String) As DataSet
        Dim dtConnectedUser As New DataSet
        Try
            Dim paraName() As String = {"Chat_For"}
            Dim paraValue() As String = {Chat_For}
            dtConnectedUser = Get_DataSet(SqlQuery.S_CHAT, paraName, paraValue)
            If dtConnectedUser.Tables.Count > 0 Then
                Return dtConnectedUser
            Else
                Return Nothing
            End If
        Catch ex As Exception
            logger.Error(ex.Message, ex)
            Return Nothing
        End Try

    End Function
    Public Function SelectUserConnectionsById(ByVal Chat_For As String, ByVal UserId As String) As DataSet
        Dim dtConnectedUser As New DataSet
        Try
            Dim paraName() As String = {"Chat_For", "UserId"}
            Dim paraValue() As String = {Chat_For, UserId}
            dtConnectedUser = Get_DataSet(SqlQuery.S_CHAT, paraName, paraValue)
            If dtConnectedUser.Tables.Count > 0 Then
                Return dtConnectedUser
            Else
                Return Nothing
            End If
        Catch ex As Exception
            logger.Error(ex.Message, ex)
            Return Nothing
        End Try

    End Function
    Public Sub DeleteConnectedUser(ByVal Chat_For As String, ByVal authsession As String)
        Try
            Dim paraName() As String = {"Chat_For", "authsession"}
            Dim paraValue() As String = {Chat_For, authsession}
            RunStoredProc(SqlQuery.S_CHAT, paraName, paraValue)
        Catch ex As Exception
            logger.Error(ex.Message, ex)
        End Try

    End Sub
    Public Sub DeleteUserConnectionsById(ByVal Chat_For As String, ByVal UserId As Integer)
        Try
            Dim paraName() As String = {"Chat_For", "UserId"}
            Dim paraValue() As String = {Chat_For, UserId}
            RunStoredProc(SqlQuery.S_CHAT, paraName, paraValue)
        Catch ex As Exception
            logger.Error(ex.Message, ex)
        End Try

    End Sub
    Public Function InsertMessagedetails(ByVal Chat_For As String, ByVal FromUserId As String, ByVal ToUserId As String, ByVal Message As String) As DataSet
        Dim dtConnectedUser As New DataSet
        Try
            Dim paraName() As String = {"Chat_For", "fromUserId", "toUserId", "message"}
            Dim paraValue() As String = {Chat_For, FromUserId, ToUserId, Message}
            dtConnectedUser = Get_DataSet(SqlQuery.S_CHAT, paraName, paraValue)
            If dtConnectedUser.Tables.Count > 0 Then
                Return dtConnectedUser
            Else
                Return Nothing
            End If
        Catch ex As Exception
            logger.Error(ex.Message, ex)
            Return Nothing
        End Try

    End Function
    Public Sub DeleteChatUserId(ByVal Chat_For As String, ByVal UserId As Integer)
        Try
            Dim paraName() As String = {"Chat_For", "UserId"}
            Dim paraValue() As String = {Chat_For, UserId}
            RunStoredProc(SqlQuery.S_CHAT, paraName, paraValue)
        Catch ex As Exception
            logger.Error(ex.Message, ex)
        End Try

    End Sub
    Public Function LoadMessages(ByVal Chat_For As String, ByVal FromUserId As Integer, ByVal ToUserId As Integer, ByVal minCount As Integer, ByVal maxCount As Integer) As DataSet
        Dim dtConnectedUser As New DataSet
        Try
            Dim paraName() As String = {"Chat_For", "fromUserId", "toUserId", "minCount", "maxCount"}
            Dim paraValue() As String = {Chat_For, FromUserId, ToUserId, minCount, maxCount}
            dtConnectedUser = Get_DataSet(SqlQuery.S_CHAT, paraName, paraValue)
            If dtConnectedUser.Tables.Count > 0 Then
                Return dtConnectedUser
            Else
                Return Nothing
            End If
        Catch ex As Exception
            logger.Error(ex.Message, ex)
            Return Nothing
        End Try

    End Function
End Class
