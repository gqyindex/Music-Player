<?PHP


   header("Content-type:text/html;charset=utf-8");

   $connect = mysqli_connect('localhost','root','','music');

   mysqli_query($connect,"SET NAMES 'utf8'");

   if(!$connect){
   	exit('数据库连接失败');
   };
	
	$sql = "select id,name , musicName from music_list";
	
	$query = mysqli_query($connect, $sql);
	
	if( $query && mysqli_num_rows($query) ){
		while($row = mysqli_fetch_assoc($query)){
			$data[] = $row;
		}
		echo json_encode($data);
	}

?>