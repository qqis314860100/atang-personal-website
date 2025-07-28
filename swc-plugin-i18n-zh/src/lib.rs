#![allow(clippy::not_unsafe_ptr_arg_deref)]

use serde::Deserialize;
use swc_core::ecma::{
    ast::*,
    visit::{as_folder, FoldWith, VisitMut, VisitMutWith},
};
use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    pub messages_dir: String,
    pub default_locale: String,
}

pub struct TransformVisitor {
    config: Config,
}

impl VisitMut for TransformVisitor {
    fn visit_mut_call_expr(&mut self, call: &mut CallExpr) {
        // 检查是否是 t('中文') 形式的调用
        if let Callee::Expr(expr) = &call.callee {
            if let Expr::Ident(ident) = &**expr {
                if ident.sym.to_string() == "t" {
                    if let Some(arg) = call.args.first_mut() {
                        if let Expr::Lit(Lit::Str(str_lit)) = &mut *arg.expr {
                            // 在这里查找中文对应的英文 key
                            // 这里简化处理，实际需要读取 messages 目录下的文件
                            let zh_text = str_lit.value.to_string();
                            if let Some(en_key) = self.get_en_key(&zh_text) {
                                str_lit.value = en_key.into();
                            }
                        }
                    }
                }
            }
        }

        call.visit_mut_children_with(self);
    }
}

impl TransformVisitor {
    fn get_en_key(&self, zh_text: &str) -> Option<String> {
        // 这里需要实现从 messages 目录读取映射关系
        // 简化示例：
        match zh_text {
            "附件管理" => Some("attachmentManagement".into()),
            "简历内容" => Some("resumeContent".into()),
            _ => None,
        }
    }
}

#[plugin_transform]
pub fn process_transform(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
    let config = serde_json::from_str::<Config>(
        &metadata.get_transform_plugin_config().expect("Failed to get plugin config"),
    )
    .expect("Invalid plugin config");

    program.fold_with(&mut as_folder(TransformVisitor { config }))
} 