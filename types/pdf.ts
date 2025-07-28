// PDF注释类型定义
export type PDFAnnotation = {
  id: string
  userId: string
  pdfUrl: string
  x: number
  y: number
  text: string
  page: number
  timestamp: string
  createdAt: string
  updatedAt: string
}

// 创建注释的数据类型
export type CreateAnnotationData = Omit<
  PDFAnnotation,
  'id' | 'userId' | 'timestamp' | 'createdAt' | 'updatedAt'
>

// 更新注释的数据类型
export type UpdateAnnotationData = Partial<
  Pick<PDFAnnotation, 'text' | 'x' | 'y' | 'page'>
>
