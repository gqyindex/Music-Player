<?PHP

	 header("Content-type:text/html;charset=utf-8");

       $connect = mysqli_connect('localhost','root','','music');

       mysqli_query($connect,"SET NAMES 'utf8'");

       if(!$connect){
       	exit('数据库连接失败');
       };

	$id = $_GET['id'];

	$sql = "select * from music_list where id = $id";
	
	$query = mysqli_query($connect,$sql);
	
	if( $query && mysqli_num_rows($query) ){
		echo json_encode(mysqli_fetch_assoc($query));
	}

?>