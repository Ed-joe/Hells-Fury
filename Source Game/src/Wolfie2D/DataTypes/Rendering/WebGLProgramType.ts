/** A container for info about a webGL shader program */
export default class WebGLProgramType {
	/** A webGL program */
	program: WebGLProgram;
	
	/** A vertex shader */
	vertexShader: WebGLShader;

	/** A fragment shader */
	fragmentShader: WebGLShader;

	/**
	 * Deletes this shader program
	 */
	delete(gl: WebGLRenderingContext): void {
		// Clean up all aspects of this program
		if(this.program){
			gl.deleteProgram(this.program);
		}
			
		if(this.vertexShader){
			gl.deleteShader(this.vertexShader);
		}

		if(this.fragmentShader){
			gl.deleteShader(this.fragmentShader);
		}
	}
}