' ============================================================================
' LaTeX Question Parser - Desktop Shortcut Creator
' Tạo shortcut trên desktop để khởi động Streamlit
' ============================================================================

Dim objShell, objFSO, strDesktop, objShortcut, strScriptPath, strBatPath

' Tạo các objects
Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Lấy đường dẫn desktop
strDesktop = objShell.SpecialFolders("Desktop")

' Lấy đường dẫn thư mục hiện tại
strScriptPath = objFSO.GetParentFolderName(WScript.ScriptFullName)
strBatPath = strScriptPath & "\start-streamlit.bat"

' Kiểm tra file .bat có tồn tại không
If Not objFSO.FileExists(strBatPath) Then
    MsgBox "Không tìm thấy file start-streamlit.bat!" & vbCrLf & _
           "Vui lòng đảm bảo file này tồn tại trong cùng thư mục.", _
           vbCritical, "Lỗi"
    WScript.Quit
End If

' Tạo shortcut
Set objShortcut = objShell.CreateShortcut(strDesktop & "\LaTeX Question Parser.lnk")

With objShortcut
    .TargetPath = strBatPath
    .WorkingDirectory = strScriptPath
    .Description = "LaTeX Question Parser - Streamlit Application"
    .IconLocation = "shell32.dll,21"  ' Icon file/document
    .WindowStyle = 1  ' Normal window
    .Save
End With

' Thông báo thành công
MsgBox "Shortcut đã được tạo thành công trên Desktop!" & vbCrLf & _
       "Tên: LaTeX Question Parser" & vbCrLf & _
       "Bạn có thể double-click vào shortcut để khởi động ứng dụng.", _
       vbInformation, "Thành công"

' Cleanup
Set objShortcut = Nothing
Set objFSO = Nothing
Set objShell = Nothing
