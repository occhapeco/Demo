<?php
	require_once('lib/nusoap.php');

	$server = new soap_server;
	$server->configureWSDL('service','urn:service');
	$namespace = 'urn:service';
	$server->wsdl->schemaTargetNamespace = $namespace;

	function select_cupons($usuario_id,$cidade,$pagamento,$tipo_id,$num)
	{
		$tipo_id = json_decode($tipo_id);
		for($i=0;$i<sizeof($tipo_id);$i++)
		{
			if($i != 0)
				$str_tipo .= "AND"
			$str_tipo .= " cupom_has_tipo.tipo_id = ".$tipo_id[$i]." ";
		}
		$conexao = mysqli_connect("localhost","u274667541_root","oieoie","u274667541_app");
		$query = $conexao->query("SELECT cupom.id,cupom.titulo,cupom.preco_normal,cupom.preco_cupom,cupom.prazo,cupom.quantidade,empresa.nome_fantasia FROM cupom INNER JOIN cupom_has_tipo ON (cupom.id = cupom_has_tipo.cupom_id) INNER JOIN endereco ON (endereco.id = cupom.endereco_id) INNER JOIN empresa ON (cupom.empresa_id = empresa.id) WHERE $str_tipo AND endereco.cidade = $cidade AND cupom.pagamento = $pagamento AND cupom.quantidade > 0 AND cupom.estado = 0 ORDER BY cupom.prioridade DESC");
		$dados = array();
		$i = 0
		$max = $num + 5;
		while($row = $query->fetch_assoc())
		{
			$sub_query = $conexao->query("SELECT * FROM cupom_has_tipo WHERE estado <> 0 AND usuario_id = $usuario_id AND cupom_id = ".$row["id"]);
			if($i > $num && $i < $max && $sub_query->num_rows() == 0)
				$dados[$i] = $row;
			$i++;
		}
		$conexao->close();
		return json_encode($dados);
	}

	$server->register('select_cupons', array('usuario_id' => 'xsd:integer','cidade' => 'xsd:string','pagamento' => 'xsd:integer','tipo_id' => 'xsd:string','num' => 'xsd:integer'), array('return' => 'xsd:string'),$namespace,false,'rpc','encoded','Selecionar cupons com filtros e limite de 5. ');

	function select_detalhes_cupom($cupom_id)
	{
		$conexao = mysqli_connect("localhost","u274667541_root","oieoie","u274667541_app");
		$query = $conexao->query("SELECT cupom.regras,cupom.descricao,cupom.pagamento,cupom.delivery,endereco.rua,endereco.num,endereco.complemento,endereco.bairro,endereco.latitude,endereco.longitude FROM cupom INNER JOIN endereco ON (endereco.id = cupom.endereco_id)  WHERE cupom.id = $cupom_id");
		$dados = array();
		$row = $query->fetch_assoc();
		$dados["detalhes"] = $row;
		$query = $conexao->query("SELECT tipo.nome FROM cupom_has_tipo INNER JOIN tipo ON (tipo.id = cupom_has_tipo.tipo_id)  WHERE cupom_has_tipo.cupom_id = $cupom_id");
		while($row = $query->fetch_assoc())
			$dados["tipos"][] = $row;
		$conexao->close();
		return json_encode($dados);
	}

	$server->register('select_detalhes_cupom', array('cupom_id' => 'xsd:integer'), array('return' => 'xsd:string'),$namespace,false,'rpc','encoded','Selecionar detalhes de um cupom. ');

	function pegar_cupom($usuario_id,$cupom_id)
	{
		$conexao = mysqli_connect("localhost","u274667541_root","oieoie","u274667541_app");
		$query = $conexao->query("UPDATE cupom SET quantidade = quantidade - 1 WHERE id = $cupom_id AND quantidade > 0");
		if($query)
		{
			$query = $conexao->query("UPDATE cupom SET estado = 1 WHERE id = $cupom_id AND quantidade = 0 AND estado = 0");
			$query = $conexao->query("SELECT * FROM cupom WHERE id = $cupom_id");
			$row = $query->fetch_assoc();
			$query = $conexao->query("INSERT INTO usuario_has_cupom VALUES(NULL,$cupom_id,$usuario_id,0,".$row["preco_cupom"].",'".$row["prazo"]."',".$row["pagamento"].",".$row["delivery"].")");
		}
		$conexao->close();
		return false;
	}

	$server->register('pegar_cupom', array('usuario_id' => 'xsd:integer','cupom_id' => 'xsd:integer'), array('return' => 'xsd:boolean'),$namespace,false,'rpc','encoded','Pegar cupom, baixa automaticamente');

	function insert_usuario($nome,$email,$senha,$celular,$genero,$nascimento)
	{
		$nome = preg_replace('![*#/\"´`]+!','',$nome);
		$email = preg_replace('![*#/\"´`]+!','',$email);
		$celular = preg_replace("![^0-9]+!",'',$celular);
		$nascimento = preg_replace('![^0-9/]+!','',$nascimento);
		$senha = password_hash($senha, PASSWORD_DEFAULT);

		$conexao = mysqli_connect("localhost","u274667541_root","oieoie","u274667541_app");
		$query = $conexao->query("INSERT INTO usuario VALUES(NULL,'$nome','$email','$senha','$celular',$genero,'$nascimento',0)");
		$id = 0;
		if($query)
	    	return $conexao->insert_id;
		$conexao->close();
		return $id;
	}

	$server->register('insert_usuario', array('nome' => 'xsd:string','email' => 'xsd:string','senha' => 'xsd:string','celular' => 'xsd:string','genero' => 'xsd:integer','nascimento' => 'xsd:string'), array('return' => 'xsd:integer'),$namespace,false,'rpc','encoded','Cadastro de usuário.');

	function update_perfil($id,$nome,$celular,$genero,$nascimento)
	{
		$nome = preg_replace('![*#/\"´`]+!','',$nome);
		$celular = preg_replace("![^0-9]+!",'',$celular);
		$nascimento = preg_replace('![^0-9/]+!','',$nascimento);

		$conexao = mysqli_connect("localhost","u274667541_root","oieoie","u274667541_app");
		$query = $conexao->query("UPDATE usuario SET nome = '$nome', celular = '$celular', genero = $genero, nascimento = '$nascimento' WHERE id = $id");
		$conexao->close();
		return $query;
	}

	$server->register('update_perfil', array('id' => 'xsd:integer','nome' => 'xsd:string','celular' => 'xsd:string','genero' => 'xsd:integer','nascimento' => 'xsd:string'), array('return' => 'xsd:boolean'),$namespace,false,'rpc','encoded','Alterar perfil do usuário.');

	function update_senha($id,$senha_antiga,$senha_nova)
	{
		$senha_antiga = password_hash($senha_antiga, PASSWORD_DEFAULT);
		$conexao = mysqli_connect("localhost","u274667541_root","oieoie","u274667541_app");
		$query = $conexao->query("SELECT * FROM usuario WHERE id = $id AND senha = '$senha_antiga'");
		if($query->num_rows() == 1)
		{
			$senha_nova = password_hash($senha_nova, PASSWORD_DEFAULT);
			$query = $conexao->query("UPDATE usuario SET senha = '$senha_nova' WHERE id = $id");
		}
		$conexao->close();
		return $query;
	}

	$server->register('update_senha', array('id' => 'xsd:integer','senha_antiga' => 'xsd:string','senha_nova' => 'xsd:string'), array('return' => 'xsd:boolean'),$namespace,false,'rpc','encoded','Alterar senha do usuário.');

	function select_perfil($id)
	{
		$conexao = mysqli_connect("localhost","u274667541_root","oieoie","u274667541_app");
		$query = $conexao->query("SELECT * FROM usuario WHERE id = $id");
		$row = $query->fetch_assoc();
		$conexao->close();
		return json_encode($row);
	}

	$server->register('select_perfil', array('id' => 'xsd:integer'), array('return' => 'xsd:string'),$namespace,false,'rpc','encoded','Seleciona dados de um usuario.');

	function select_historico($id)
	{
		$conexao = mysqli_connect("localhost","u274667541_root","oieoie","u274667541_app");
		$query = $conexao->query("SELECT * FROM usuario_has_cupom INNER JOIN usuario ON(cupom.usuario_id = usuario.id) WHERE usuario.id = $id");
		$dados = array();
		while($row = $query->fetch_assoc())
			$dados[] = $row;
		$conexao->close();
		return json_encode($dados);
	}

	$server->register('select_historico', array('id' => 'xsd:integer'), array('return' => 'xsd:string'),$namespace,false,'rpc','encoded','Seleciona histórico do usuario.');

	$HTTP_RAW_POST_DATA = isset($HTTP_RAW_POST_DATA) ? $HTTP_RAW_POST_DATA : '';
	$server->service($HTTP_RAW_POST_DATA);
?>