<!-- filepath: f:\wep al nour\send-email.php -->
<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';
session_start(); // بدء الجلسة

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // التحقق من آخر وقت إرسال
    if (isset($_SESSION['last_email_time']) && (time() - $_SESSION['last_email_time']) < 60) {
        echo "يرجى الانتظار دقيقة واحدة قبل إرسال رسالة أخرى.";
        exit;
    }

    // التحقق من صحة البيانات
    $name = htmlspecialchars(trim($_POST['name']));
    $email = filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL);
    $message = htmlspecialchars(trim($_POST['message']));

    if (empty($name) || empty($email) || empty($message)) {
        echo "يرجى ملء جميع الحقول المطلوبة.";
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "يرجى إدخال بريد إلكتروني صالح.";
        exit;
    }

    $to_email = "omarlildieaya.walaeilan@gmail.com"; // البريد الإلكتروني المستلم
    $mail = new PHPMailer(true);

    try {
        // إعدادات SMTP
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com'; // خادم SMTP
        $mail->SMTPAuth = true;
        $mail->Username = 'alnourgroup0o@gmail.com'; // بريدك الإلكتروني
        $mail->Password = '01005590440omarsalih'; // كلمة المرور
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        // إعدادات البريد
        $mail->setFrom($email, $name);
        $mail->addAddress($to_email);
        $mail->Subject = "رسالة جديدة من موقع النور جروب";
        $mail->Body = "الاسم: $name\nالبريد الإلكتروني: $email\n\nالرسالة:\n$message";

        $mail->send();

        // تحديث وقت الإرسال الأخير
        $_SESSION['last_email_time'] = time();

        echo "تم إرسال رسالتك بنجاح!";
    } catch (Exception $e) {
        echo "حدث خطأ أثناء إرسال الرسالة: {$mail->ErrorInfo}";
    }
} else {
    echo "طلب غير صالح.";
}
?>