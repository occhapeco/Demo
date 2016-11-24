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
		$query = $conexao->query("SELECT cupom.id,cupom.titulocupom.regras,cupom.descricao,cupom.preco_normal,cupom.preco_cupom,cupom.prazo,cupom.quantidade,cupom.pagamento,empresa.nome_fantasia,endereco.rua,endereco.num,endereco.complemento,endereco.bairro,endereco.cidade,endereco.uf,endereco.latitude,endereco.longitude,endereco.latitude,endereco.telefone FROM cupom INNER JOIN cupom_has_tipo ON (cupom.id = cupom_has_tipo.cupom_id) INNER JOIN endereco ON (endereco.id = cupom.endereco_id) INNER JOIN empresa ON (cupom.empresa_id = empresa.id) WHERE $str_tipo AND endereco.cidade = $cidade AND cupom.pagamento = $pagamento AND cupom.quantidade <> 0 AND cupom.estado = 0 ORDER BY cupom.prioridade DESC");
		$dados = array();
		$i = 0
		$max = $num + 5;
		while($row = $query->fetch_assoc())
		{
			$sub_query = $conexao->query("SELECT * FROM cupom_has_tipo WHERE estado <> 0 AND usuario_id = $usuario_id AND cupom_id = ".$row["id"]);
			if($i > $num && $i < $max && $sub_query->num_rows() == 0)
			{
				$dados[$i] = $row;
				$dados[$i]["tipo"] = array();
				$sub_query = $conexao->query("SELECT * FROM tipo INNER JOIN cupom_has_tipo ON (cupom.id = cupom_has_tipo.cupom_id) WHERE cupom_has_tipo.cupom_id = ".$row["id"]);
				while($sub_row = $query->fetch_assoc())
					$dados[$i]["tipo"][] = $sub_row;
			}
			$i++;
		}
		$conexao->close();		
		return json_encode($dados);
	}

	$server->register('select_cupons', array('usuario_id' => 'xsd:integer','cidade' => 'xsd:string','pagamento' => 'xsd:integer','tipo_id' => 'xsd:string','num' => 'xsd:integer'), array('return' => 'xsd:string'),$namespace,false,'rpc','encoded','Selecionar cupons com filtros e limite de 5. ');

	function pegar_cupom($usuario_id,$cupom_id)
	{
		$conexao = mysqli_connect("localhost","u274667541_root","oieoie","u274667541_app");
		$query = $conexao->query("UPDATE cupom SET quantidade = quantidade - 1 WHERE id = $cupom_id AND quantidade > 0");
		if($query)
		{
			$query = $conexao->query("UPDATE cupom SET estado = 1 WHERE id = $cupom_id AND quantidade = 0 AND estado = 0");
			$query = $conexao->query("INSERT INTO usuario_has_cupom VALUES(NULL,$cupom_id,$usuario_id,0)");
			return true;
		}
		else
			return false;
	}

	$server->register('pegar_cupom', array('usuario_id' => 'xsd:integer','cupom_id' => 'xsd:integer'), array('return' => 'xsd:boolean'),$namespace,false,'rpc','encoded','Pegar cupom, baixa automaticamente');


	$HTTP_RAW_POST_DATA = isset($HTTP_RAW_POST_DATA) ? $HTTP_RAW_POST_DATA : '';
	$server->service($HTTP_RAW_POST_DATA);
?>


?>